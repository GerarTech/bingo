# Pre-generated Audio Files for BINGO

## Optimized Directory Structure
```
public/audio/
├── en/                    # English audio files (30 files total)
│   ├── B.mp3             # "B"
│   ├── I.mp3             # "I"
│   ├── N.mp3             # "N"
│   ├── G.mp3             # "G"
│   ├── O.mp3             # "O"
│   ├── 1.mp3 - 9.mp3     # "1" through "9"
│   ├── 10.mp3            # "ten"
│   ├── 11.mp3            # "eleven" (SPECIAL - not "ten-one")
│   ├── 12.mp3            # "twelve" (SPECIAL - not "ten-two")
│   ├── 13.mp3            # "thirteen" (SPECIAL)
│   ├── 14.mp3            # "fourteen" (SPECIAL)
│   ├── 15.mp3            # "fifteen" (SPECIAL)
│   ├── 16.mp3            # "sixteen" (SPECIAL)
│   ├── 17.mp3            # "seventeen" (SPECIAL)
│   ├── 18.mp3            # "eighteen" (SPECIAL)
│   ├── 19.mp3            # "nineteen" (SPECIAL)
│   ├── 20.mp3            # "twenty"
│   ├── 30.mp3            # "thirty"
│   ├── 40.mp3            # "forty"
│   ├── 50.mp3            # "fifty"
│   ├── 60.mp3            # "sixty"
│   └── 70.mp3            # "seventy"
└── am/                    # Amharic audio files (21 files total)
    ├── B.mp3             # "ቢ"
    ├── I.mp3             # "አይ"
    ├── N.mp3             # "ኤን"
    ├── G.mp3             # "ጂ"
    ├── O.mp3             # "ኦ"
    ├── 1.mp3 - 9.mp3     # "አንድ" through "ዘጠኝ"
    ├── 10.mp3            # "አስር"
    ├── 20.mp3            # "ሃያ"
    ├── 30.mp3            # "ሰላሳ"
    ├── 40.mp3            # "አርባ"
    ├── 50.mp3            # "ሃምሳ"
    ├── 60.mp3            # "ስልሳ"
    └── 70.mp3            # "ሰባ"
```

## Total Files Needed: 51 (30 English + 21 Amharic)

### English (30 files):
- 5 letters (B, I, N, G, O)
- 9 units (1-9)
- 1 ten (10)
- 9 special teens (11-19)
- 6 tens (20, 30, 40, 50, 60, 70)

### Amharic (21 files):
- 5 letters (B, I, N, G, O)
- 9 units (1-9)
- 7 tens (10, 20, 30, 40, 50, 60, 70)

## How it Works

### English Numbers:
- **1-9**: Single file (e.g., `5.mp3` → "five")
- **10, 20, 30, 40, 50, 60, 70**: Single base file (e.g., `30.mp3` → "thirty")
- **11-19**: SPECIAL files (e.g., `11.mp3` → "eleven", NOT "ten-one")
- **21-29, 31-39, etc.**: Base + unit (e.g., `23.mp3` = `20.mp3` + `3.mp3` → "twenty-three")

### Amharic Numbers:
- **1-9**: Single file (e.g., `5.mp3` → "አምስት")
- **10, 20, 30, 40, 50, 60, 70**: Single base file (e.g., `30.mp3` → "ሰላሳ")
- **11-19, 21-29, etc.**: Base + unit (e.g., `23` = `20.mp3` + `3.mp3` → "ሃያ ሶስት")

## Examples:

### English B-11:
1. Play `/audio/en/B.mp3` → "B"
2. Play `/audio/en/11.mp3` → "eleven"
- Result: "B eleven" ✓

### English B-23:
1. Play `/audio/en/B.mp3` → "B"
2. Play `/audio/en/20.mp3` → "twenty"
3. Play `/audio/en/3.mp3` → "three"
- Result: "B twenty-three" ✓

### Amharic I-11:
1. Play `/audio/am/I.mp3` → "አይ"
2. Play `/audio/am/10.mp3` → "አስር"
3. Play `/audio/am/1.mp3` → "አንድ"
- Result: "አይ አስራ አንድ" ✓

### Amharic I-23:
1. Play `/audio/am/I.mp3` → "አይ"
2. Play `/audio/am/20.mp3` → "ሃያ"
3. Play `/audio/am/3.mp3` → "ሶስት"
- Result: "አይ ሃያ ሶስት" ✓

### English O-75:
1. Play `/audio/en/O.mp3` → "O"
2. Play `/audio/en/70.mp3` → "seventy"
3. Play `/audio/en/5.mp3` → "five"
- Result: "O seventy-five" ✓

## How to Generate Audio Files

### Option 1: Using ElevenLabs (Recommended)
1. Sign up at https://elevenlabs.io
2. Generate each sound separately
3. Download as MP3
4. Place in appropriate folders

### Option 2: Using online TTS services
- Use https://ttsmp3.com or similar
- Generate each sound individually

### Option 3: Using Google Cloud TTS
```bash
# Generate using gcloud CLI
gcloud ml speech synthesize ...
```

## Amharic Number Words Reference
```
Units (1-9):
1: አንድ, 2: ሁለት, 3: ሶስት, 4: አራት, 5: አምስት
6: ስድስት, 7: ሰባት, 8: ስምንት, 9: ዘጠኝ

Tens (10, 20, 30, 40, 50, 60, 70):
10: አስር, 20: ሃያ, 30: ሰላሳ, 40: አርባ
50: ሃምሳ, 60: ስልሳ, 70: ሰባ

Combined examples:
11: አስራ አንድ (10 + 1)
23: ሃያ ሶስት (20 + 3)
75: ሰባ አምስት (70 + 5)
```

## Column Names
- **B** = ቢ (Amharic) / B (English)
- **I** = አይ (Amharic) / I (English)
- **N** = ኤን (Amharic) / N (English)
- **G** = ጂ (Amharic) / G (English)
- **O** = ኦ (Amharic) / O (English)

## Testing
After placing audio files:
1. Open the game in browser
2. Enable voice in settings
3. Draw numbers
4. You should hear correct pronunciation for all numbers 1-75

## Important Notes
- **English 11-19 MUST be separate files** (eleven, twelve, etc.)
- **Amharic 11-19 use base + unit** (አስራ + አንድ = "አስራ አንድ")
- Files are played sequentially with small delays
- If a file is missing, the system silently skips it (no crash)
- Audio files should be short (0.5-1.5 seconds each)
- Use consistent voice/tone across all files