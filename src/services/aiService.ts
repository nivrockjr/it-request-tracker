
import { ChatMessage } from '@/types';

export interface ChatRequest {
  message: string;
  userId: string;
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  suggestions?: string[];
}

export interface AIResponse {
  message: string;
  conversationId?: string;
}

export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const sendMessageToAI = async (message: string, conversationId?: string): Promise<AIResponse> => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const request: ChatRequest = {
    message,
    userId: user.id,
    conversationId
  };

  const response = await sendChatMessage(request);
  
  return {
    message: response.response,
    conversationId: response.conversationId
  };
};

export const getChatHistory = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('conversation_data')
      .eq('id', conversationId)
      .single();

    if (error) throw error;

    // Safely parse the conversation data with proper type casting
    if (data?.conversation_data && Array.isArray(data.conversation_data)) {
      return (data.conversation_data as unknown as ChatMessage[]) || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

export const createConversation = async (userId: string): Promise<string> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        conversation_data: [],
        last_message_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};
