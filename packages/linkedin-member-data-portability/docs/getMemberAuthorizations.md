## getMemberAuthorizations()

Retrieves member authorizations.

```typescript
async getMemberAuthorizations(): Promise<z.infer<typeof MemberComplianceAuthorizationSchema>>
```

**Returns:**

- `Promise<z.infer<typeof MemberComplianceAuthorizationSchema>>`: The member authorization data.

**Throws:**

- `Error`: If retrieving authorizations fails.