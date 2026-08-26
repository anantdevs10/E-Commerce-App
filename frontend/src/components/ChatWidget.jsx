import { useState } from "react";
import api from "../api/api";

function ChatWidget() {

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { from: "bot", text: "Hi! Ask me about an order, stock, or current offers." }
    ]);
    const [sending, setSending] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { from: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setSending(true);

        try {
            const res = await api.post("chat/", { message: userMessage.text });
            setMessages((prev) => [...prev, { from: "bot", text: res.data.reply }]);
        } catch {
            setMessages((prev) => [...prev, { from: "bot", text: "Something went wrong." }]);
        } finally {
            setSending(false);
        }
    };

    return (

        <div className="fixed bottom-6 right-6 z-20">

            {open && (
                <div className="w-80 h-96 bg-paper border border-line rounded-sm shadow-lg flex flex-col mb-3">

                    <div className="p-4 border-b border-line font-display font-semibold text-sm">
                        Help
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`text-sm p-2 rounded-sm max-w-[85%] ${
                                    m.from === "user"
                                        ? "bg-moss text-paper self-end"
                                        : "bg-sand text-ink self-start"
                                }`}
                            >
                                {m.text}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={sendMessage} className="p-3 border-t border-line flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message…"
                            className="flex-1 border border-line rounded-sm px-3 py-1.5 text-sm outline-none focus:border-moss"
                        />
                        <button
                            type="submit"
                            disabled={sending}
                            className="bg-moss text-paper text-sm px-3 rounded-sm disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>

                </div>
            )}

            <button
                onClick={() => setOpen(!open)}
                className="bg-moss text-paper w-14 h-14 rounded-full shadow-lg font-display text-xl"
            >
                {open ? "×" : "?"}
            </button>

        </div>

    );

}

export default ChatWidget;