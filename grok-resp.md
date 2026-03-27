**The smartest way is screen casting/mirroring from a phone to the TV.**  
It requires **zero setup on the TV**, works on literally any smart TV (Samsung, LG, Android TV/Google TV, Fire TV, etc.), works in every house (grandma’s, parents’, aunt’s…), and needs no bookmarks, no apps installed on the TV, and no typing long URLs on the terrible TV remote keyboard.

### Why this is perfect for your game
Your game already does everything right technically:
- Host creates room → gets a short room code.
- Spectator link is super clean:  
  `https://huroof-abdo.vercel.app/game?role=spectator&room=XXXXXX`
- The URL **auto-connects** as spectator (no extra clicks). PeerJS + the `role=spectator` param handles everything.

So the flow becomes dead simple:

1. You (host) create the game as usual (`/game?role=host`).
2. Share the **spectator link** (or the QR that already exists in the host page) with one family member’s phone:
   - Easiest: WhatsApp the link, or they just scan the QR you show on your phone/laptop.
3. On the **phone** they open the link → instantly enters spectate mode (live board, questions, everything).
4. On the **TV** they just hit the cast/mirroring button (usually one click in the quick settings menu):
   - Samsung → Smart View  
   - LG → Screen Share / AirPlay  
   - Android TV / Google TV → Cast / Chromecast built-in  
   - Any other → Screen Mirroring / Miracast  
5. Phone casts the browser tab (or whole screen) to the TV → whole family sees huge live spectate and can hype the players together.

This is exactly how families already watch YouTube, TikTok, or family photos on TV. Takes 10–15 seconds once you’re used to it.

### Tiny improvement you can add in 10 minutes (optional but makes it feel premium)
Since the repo is open and you’re using Next.js, add one button on the host screen:

In `src/app/host/page.tsx` (or wherever your host controls/QR live), add something like:

```tsx
<button 
  onClick={() => {
    const spectateUrl = `${window.location.origin}/game?role=spectator&room=${roomCode}`;
    navigator.clipboard.writeText(spectateUrl);
    // or show a huge QR code with that URL using qrcode.react
    alert("Spectate link copied! Send to phone → cast to TV");
  }}
>
  📺 Open Spectate on TV (copy link + huge QR)
</button>
```

You can even show a giant QR code right there labeled “Scan with phone → cast to TV”.  
This makes the whole “get the link to phone” step one tap.

You can also make the spectator view even better for TV in `src/app/components/SpectatorView.tsx`:
- Bigger fonts
- Higher contrast
- Auto-fullscreen when `?tv=true` is in the URL (or detect `window.innerWidth > 1200`)
- Hide any mobile-only UI elements

But even without any code change, the current version already works perfectly with the cast method.

### Why other ideas are worse in your case
- Typing the URL on TV → painful (long vercel domain + params).
- Bookmark / install PWA on TV → you said you don’t want per-TV setup because you move houses.
- Custom domain (e.g. huroof.tv) → works but still requires typing the room code on TV keyboard.
- Dedicated TV app → way too much work for different TV brands.

**Screen casting is the only method that is truly universal, zero-config on the TV, and feels magical for family use.**

Just try it once with your family — they’ll love seeing the big board live while you hype them. If you want me to give you the exact code snippet for the “TV Spectate” button + big QR, just say the word and I’ll write it for you.