"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import AIInput_10 from "@/components/ui/ai-input-10";
import { useState, useRef } from "react";
import Image from "next/image";
import ChatSidebar from "./ChatSidebar";

interface Message {
    id: string;
    text: string;
    type: 'user' | 'ai';
    timestamp: Date;
}

export default function AiChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [shouldFocusInput, setShouldFocusInput] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleSendMessage = (text: string) => {
        setShowWelcome(false);
        setShouldFocusInput(false);
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            type: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Show typing indicator
        setIsTyping(true);
        
        // Simulate AI response
        timeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "This is a sample AI response to demonstrate the chat bubble layout.",
                type: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setShouldFocusInput(true);
        }, 2000);
    };

    const handleStopAIResponse = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            setIsTyping(false);
            setShouldFocusInput(true);
        }
    };

    return (
        <>
            <div className="w-full min-h-screen flex flex-col items-center justify-between bg-white dark:bg-black px-4 relative">
                {showWelcome ? (
                    <div className="flex-1 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                            className={cn("text-center mb-10", "opacity-100 scale-100")}
                        >
                            <h1 className="text-5xl md:text-8xl font-medium mb-4 text-black dark:text-white">
                                <span className="font-times-bold-italic text-[#FF4006]">Hi</span> Aswin
                            </h1>
                            <p className="text-xl text-zinc-400">
                                Leks here, what can I do for you today?
                            </p>
                        </motion.div>
                    </div>
                ) : (
                    <div className="flex-1 w-full max-w-3xl flex flex-col justify-end overflow-hidden pt-4 pb-48">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                            className="overflow-y-auto"
                        >
                            <div className="flex flex-col gap-4 p-4">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex items-end gap-2",
                                            message.type === 'user' ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {message.type === 'ai' && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1">
                                                <Image
                                                    src="/ai_avatar.svg"
                                                    alt="AI Avatar"
                                                    width={32}
                                                    height={32}
                                                />
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                "max-w-[80%] px-4 py-2 rounded-2xl",
                                                message.type === 'user' 
                                                    ? "bg-purple-600 text-white rounded-br-none" 
                                                    : "bg-purple-100 dark:bg-purple-900/30 text-black dark:text-white rounded-bl-none"
                                            )}
                                        >
                                            {message.text}
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-end gap-2"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1">
                                            <Image
                                                src="/ai_avatar.svg"
                                                alt="AI Avatar"
                                                width={32}
                                                height={32}
                                            />
                                        </div>
                                        <div className="bg-purple-100 dark:bg-purple-900/30 px-4 py-4 rounded-2xl rounded-bl-none">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-typing-1"/>
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-typing-2"/>
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-typing-3"/>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Animated Gradient Bar at Bottom Edge */}
                <div className="fixed bottom-0 left-0 right-0 w-full h-32 z-40 pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-24 overflow-hidden">
                        <div
                            className="w-full h-full animate-gradient-move bg-gradient-to-r from-orange-400 via-pink-400 to-blue-500 opacity-60 blur-2xl"
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Floating AI Input at Bottom Center */}
                <div className="fixed bottom-6 flex justify-center items-center z-50 w-full px-4 pointer-events-none">
                    <div className="pointer-events-auto w-full max-w-3xl">
                        <AIInput_10 
                            onSendMessage={handleSendMessage} 
                            isAITyping={isTyping}
                            onStopAIResponse={handleStopAIResponse}
                            shouldFocus={shouldFocusInput}
                        />
                    </div>
                </div>

                <style jsx global>{`
                    @keyframes gradient-move {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animate-gradient-move {
                        animation: gradient-move 8s ease-in-out infinite;
                    }
                    @keyframes typing {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-5px); }
                    }
                    .animate-typing-1 {
                        animation: typing 1s infinite;
                    }
                    .animate-typing-2 {
                        animation: typing 1s infinite;
                        animation-delay: 0.2s;
                    }
                    .animate-typing-3 {
                        animation: typing 1s infinite;
                        animation-delay: 0.4s;
                    }
                `}</style>
            </div>
            <ChatSidebar />
        </>
    );
}
