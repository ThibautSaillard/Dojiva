---
name: Animations de sortie vs navigation
description: Pourquoi les drawers/menus fermés pendant une navigation ne doivent pas avoir d'animation de sortie pilotée par une lib
---

# Animation de sortie + navigation = panneau orphelin figé

**Règle :** tout élément overlay destiné à se fermer PENDANT une navigation SPA (drawer de menu, palette, sheet mobile) doit être un rendu conditionnel sec (`{open && <div className="animate-in …">}`) — animation d'ENTRÉE en CSS pur uniquement, JAMAIS d'animation de sortie pilotée par Radix Presence ou framer-motion AnimatePresence.

**Why:** quand la navigation re-rend l'arbre au milieu de l'animation de sortie, le mécanisme « garder le nœud monté jusqu'à la fin de l'anim » (Radix Presence, AnimatePresence) se fait interrompre : le panneau reste figé à l'écran, mi-sorti, définitivement (reproduit avec Radix Sheet PUIS avec AnimatePresence sur le même drawer ; 4 cycles e2e pour isoler). La capture d'écran montrait l'overlay déjà parti et le panneau gelé aux 2/3 hors écran.

**How to apply:**
- Drawer maison : `createPortal` vers document.body (évite le piège `backdrop-filter` du header sticky qui devient containing block des `position:fixed`), rendu conditionnel, `useEffect(() => setOpen(false), [location])` en filet de sécurité, Échap + overlay + scroll lock à la main.
- Diagnostic express si « le panneau ne se ferme pas » : logger l'état au render + `aria-expanded` + `querySelectorAll('[data-testid=…]').length` via le testeur e2e — distingue en un cycle « état pas mis à jour » (aria-expanded=true) de « DOM orphelin » (état false mais nœud présent).
- Piège de validation : après un fix HMR, exiger un hard reload du navigateur de test avant de conclure à un échec.
