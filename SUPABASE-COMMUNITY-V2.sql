-- PedroAgapito.pe · Comunidad V2 Final RC
-- Reference schema for the production moderation flow.
-- The live project already contains these objects through migrations.

create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- Core objects:
-- banned_words, community_posts, community_reactions,
-- community_reaction_counts, community_reports, moderation_logs.
-- Normal-user writes use public.submit_community_post(...).
-- That function derives auth.uid(), rate-limits submissions, normalizes
-- text, checks banned_words and queues/rejects the publication.
