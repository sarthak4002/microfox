/**
 * Represents a command that can be used in WhatsApp conversations
 */
export interface Command {
  /** The name of the command (max 32 characters) */
  command_name: string;
  /** The description of what the command does (max 256 characters) */
  command_description: string;
}

/**
 * Represents the configuration for conversational components
 */
export interface ConversationalAutomation {
  /** Whether to enable welcome messages for new conversations */
  enable_welcome_message?: boolean;
  /** Array of ice breaker prompts (max 4 prompts, 80 characters each) */
  prompts?: string[];
  /** Array of available commands (max 30 commands) */
  commands?: Command[];
}

/**
 * Represents the response from getting conversational components
 */
export interface ConversationalComponentsResponse {
  /** Whether welcome messages are enabled */
  enable_welcome_message: boolean;
  /** Array of configured ice breaker prompts */
  prompts: string[];
  /** Array of configured commands */
  commands: Command[];
}
