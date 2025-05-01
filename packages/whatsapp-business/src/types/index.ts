import { z } from 'zod';
import {
  WhatsAppSDKConfigSchema,
  LocationObjectSchema,
  ContactObjectSchema,
  InteractiveMessageSchema,
  TemplateComponentSchema,
  AnalyticsOptionsSchema,
  TemplateOptionsSchema,
  ConversationalAutomationSchema,
  RequestOptionsSchema,
  BusinessProfileSchema,
  BusinessProfileUpdateSchema,
  TemplateDataSchema,
  TextMessageOptionsSchema,
  TypingIndicatorOptionsSchema,
  CommerceSettingsSchema,
  MediaUploadSchema,
  PhoneRegistrationSchema,
  ApiResponseSchema,
  ReactionSchema,
  ReplyContextSchema,
  FlowSchema,
  CommandSchema,
  ConversationalComponentsResponseSchema,
  FlowActionPayloadSchema,
  FlowParametersSchema,
  CtaUrlParametersSchema,
  ReceipientTypeSchema,
  MediaObjectSchema,
  MessageOptionsSchema,
} from '../schemas';

export type WhatsAppSDKConfig = z.infer<typeof WhatsAppSDKConfigSchema>;

export type LocationObject = z.infer<typeof LocationObjectSchema>;
export type ContactObject = z.infer<typeof ContactObjectSchema>;
export type InteractiveMessage = z.infer<typeof InteractiveMessageSchema>;
export type TemplateComponent = z.infer<typeof TemplateComponentSchema>;
export type AnalyticsOptions = z.infer<typeof AnalyticsOptionsSchema>;
export type TemplateOptions = z.infer<typeof TemplateOptionsSchema>;
export type ConversationalAutomation = z.infer<
  typeof ConversationalAutomationSchema
>;
export type MessageOptions = z.infer<typeof MessageOptionsSchema>;
export type RequestOptions = z.infer<typeof RequestOptionsSchema>;
export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;
export type BusinessProfileUpdate = z.infer<typeof BusinessProfileUpdateSchema>;
export type TemplateData = z.infer<typeof TemplateDataSchema>;
export type TextMessageOptions = z.infer<typeof TextMessageOptionsSchema>;

export type TypingIndicatorOptions = z.infer<
  typeof TypingIndicatorOptionsSchema
>;
export type CommerceSettings = z.infer<typeof CommerceSettingsSchema>;
export type MediaUpload = z.infer<typeof MediaUploadSchema>;
export type PhoneRegistration = z.infer<typeof PhoneRegistrationSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type Reaction = z.infer<typeof ReactionSchema>;
export type ReplyContext = z.infer<typeof ReplyContextSchema>;
export type Flow = z.infer<typeof FlowSchema>;
export type MediaObject = z.infer<typeof MediaObjectSchema>;
export type Command = z.infer<typeof CommandSchema>;
export type ConversationalComponentsResponse = z.infer<
  typeof ConversationalComponentsResponseSchema
>;
export type FlowActionPayload = z.infer<typeof FlowActionPayloadSchema>;
export type FlowParameters = z.infer<typeof FlowParametersSchema>;
export type CtaUrlParameters = z.infer<typeof CtaUrlParametersSchema>;

export type ReceipientType = z.infer<typeof ReceipientTypeSchema>;

// Context type for message replies
export interface Context {
  message_id: string;
}
