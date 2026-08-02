import React, { createContext, useState, useMemo, useContext } from "react";
import tokenCounter from "./tokenCounter";
import costCalculator from "./costCalculator";
import providers from "./providers";

export const ChatContext = createContext();

/**
 * Enterprise AI Configuration and Session Chat Context Provider
 */
export function ChatProvider({ children }) {
  const [activeProvider, setActiveProvider] = useState("openai");
  const [totalCost, setTotalCost] = useState(0);

  const value = useMemo(() => {
    return {
      activeProvider,
      setActiveProvider,
      totalCost,
      setTotalCost,
      providers: Object.values(providers),
      
      /**
       * Submits input prompt to active provider and tracks estimated costs
       */
      executePrompt: async (prompt, systemContext = "") => {
        const handler = providers[activeProvider];
        if (!handler) {
          throw new Error(`AI Provider "${activeProvider}" is not registered.`);
        }

        // 1. Calculate input tokens
        const inputTokens = tokenCounter.count(prompt) + tokenCounter.count(systemContext);
        
        // 2. Call strategy
        const responseText = await handler.call(prompt, systemContext);
        
        // 3. Calculate output tokens
        const outputTokens = tokenCounter.count(responseText);

        // 4. Calculate pricing costs
        const price = costCalculator.calculate(activeProvider, inputTokens, outputTokens);
        setTotalCost((prev) => prev + price.totalCost);

        return {
          text: responseText,
          inputTokens,
          outputTokens,
          cost: price.totalCost
        };
      }
    };
  }, [activeProvider, totalCost]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
export default ChatContext;
