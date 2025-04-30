import { z } from 'zod';
import {
  GmailSDKConfigSchema,
  LabelSchema,
  ListLabelsResponseSchema,
  MessageSchema,
  ListMessagesResponseSchema,
  ThreadSchema,
  ListThreadsResponseSchema,
} from '../schemas';

export type GmailSDKConfig = z.infer<typeof GmailSDKConfigSchema>;
export type Label = z.infer<typeof LabelSchema>;
export type ListLabelsResponse = z.infer<typeof ListLabelsResponseSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ListMessagesResponse = z.infer<typeof ListMessagesResponseSchema>;
export type Thread = z.infer<typeof ThreadSchema>;
export type ListThreadsResponse = z.infer<typeof ListThreadsResponseSchema>;
