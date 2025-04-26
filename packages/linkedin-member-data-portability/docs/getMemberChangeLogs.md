## getMemberChangeLogs()

Retrieves member change logs.

```typescript
async getMemberChangeLogs(startTime?: number): Promise<z.infer<typeof ChangelogEventSchema>[]>
```

**Parameters:**

- `startTime`: (Optional) The start timestamp for retrieving change logs.

**Returns:**

- `Promise<z.infer<typeof ChangelogEventSchema>[]>`: An array of change log events.

**Throws:**

- `Error`: If retrieving change logs fails.