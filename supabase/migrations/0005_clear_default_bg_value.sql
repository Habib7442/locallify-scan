-- Every existing page has bg_value = '#18181a' as a leftover hardcoded
-- default from before the theme system existed — not a deliberate user
-- customization. Left as-is, it would permanently override every theme's
-- own background. Clear it so themes render their real background until
-- a user explicitly picks a custom color via the Branding tab.
update public.pages set bg_value = null where bg_value = '#18181a';
