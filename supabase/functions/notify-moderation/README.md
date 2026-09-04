# notify-moderation

Env vars required:

- `RESEND_API_KEY`
- `MODERATION_FROM_EMAIL` (optional; default is Resend's onboarding sender)

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to the Edge Function.

Deploy:

```bash
supabase functions deploy notify-moderation
supabase secrets set RESEND_API_KEY=re_xxx MODERATION_FROM_EMAIL="PedroAgapito Comunidad <moderacion@tu-dominio.com>"
```

The admin panel invokes this function after a moderator removes a comment. The in-app notification is stored first, so the profile notice remains available even if email delivery is not configured.
