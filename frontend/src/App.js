import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API_URL from "./config";

const socket = io(API_URL, { transports: ["websocket"] });

function App() {
    const [clients, setClients] = useState([]); // [{clientId, data}, ...]

    useEffect(() => {
        socket.on("newData", (data) => {
            console.log("Nhận data từ J2ME:", data);

            setClients((prev) => {
                const existingIndex = prev.findIndex((c) => c.clientId === data.clientId);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = { clientId: data.clientId, data };
                    return updated;
                }
                return [...prev, { clientId: data.clientId, data }];
            });
        });

        return () => socket.off("newData");
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Realtime Data từ J2ME</h1>
            {clients.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888" }}>Chưa có dữ liệu</p>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        borderRadius: "8px",
                        overflow: "hidden"
                    }}
                >
                    <thead>
                    <tr style={{ backgroundColor: "#4CAF50", color: "white" }}>
                        <th style={thStyle}>Client ID</th>
                        <th style={thStyle}>Tên</th>
                        <th style={thStyle}>Level</th>
                        <th style={thStyle}>Xu</th>
                        <th style={thStyle}>Lượng</th>
                        <th style={thStyle}>HP</th>
                        <th style={thStyle}>MP</th>
                        <th style={thStyle}>Max HP</th>
                        <th style={thStyle}>Max MP</th>
                        <th style={thStyle}>Map ID</th>
                        <th style={thStyle}>X</th>
                        <th style={thStyle}>Y</th>
                    </tr>
                    </thead>
                    <tbody>
                    {clients.map((client, index) => (
                        <tr
                            key={client.clientId}
                            style={{
                                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                                transition: "background 0.3s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0f7fa")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#fff")}
                        >
                            <td style={tdStyle}>{client.clientId}</td>
                            <td style={tdStyle}>{client.data.name || "-"}</td>
                            <td style={tdStyle}>{client.data.level ?? 0}</td>
                            <td style={tdStyle}>{client.data.xu ?? 0}</td>
                            <td style={tdStyle}>{client.data.luong ?? 0}</td>
                            <td style={tdStyle}>{client.data.hp ?? 0}</td>
                            <td style={tdStyle}>{client.data.mp ?? 0}</td>
                            <td style={tdStyle}>{client.data.maxhp ?? 0}</td>
                            <td style={tdStyle}>{client.data.maxmp ?? 0}</td>
                            <td style={tdStyle}>{client.data.mapID ?? 0}</td>
                            <td style={tdStyle}>{client.data.x ?? 0}</td>
                            <td style={tdStyle}>{client.data.y ?? 0}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const thStyle = {
    padding: "10px",
    textAlign: "center",
    fontWeight: "bold",
    border: "1px solid #ddd", // Thêm border dọc
    background: "#4CAF50",
    color: "white"
};

const tdStyle = {
    padding: "8px",
    textAlign: "center",
    border: "1px solid #ddd" // Thêm border dọc
};

export default App;
