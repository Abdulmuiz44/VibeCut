# VibeCut Master Plan

## Product Goal
Build the best creator-first video editing tool for talking-head, podcast, and short-form repurposing workflows.

VibeCut should let a creator:
- upload long-form footage
- turn it into a transcript-backed project
- edit quickly from text and timeline together
- export polished social-ready clips
- keep coming back every week because the workflow is faster than manual editing

## Product Positioning
VibeCut is not a generic video editor.

It is a subscription editing workflow for creators who care about speed, consistency, and a final cut that still feels intentional.

The product should answer three questions immediately:
- What does it do?
- Why is it better than a normal editor?
- Why should someone pay to keep using it?

## Product Principles
- Transcript-first, timeline-second, never timeline-only.
- AI assists the edit, but the user always stays in control.
- Every major screen should reduce friction, not add decoration.
- The app should feel premium, dark, calm, and focused.
- The fastest path from upload to export should always be obvious.
- The product should feel better after every repeat use.

## Current State
The app already has:
- Google-only auth via NextAuth
- `public.users` ownership for app data
- a conversion-focused homepage
- dashboard, project creation, upload, editor, and export surfaces
- a timeline editor with transcript and AI prompts
- a dark Supabase-inspired visual direction

## What Still Matters Most
The next real product improvements should focus on editing quality and repeat use.

### 1. Make the editor feel truly fast
- drag-to-trim timeline blocks
- waveform or thumbnail cues in the timeline
- smoother playhead syncing
- better undo and redo behavior
- keyboard shortcuts for every frequent action

### 2. Make edits feel safer and more trustworthy
- persistent save state
- visible edit history
- restore points or version snapshots
- stronger handling for failed AI or export requests

### 3. Make exports feel like a finished product
- export queue with visible progress
- clearer render status states
- download / share / re-export flow
- export presets for social formats

### 4. Make the product worth paying for repeatedly
- recurring usage limits tied to value, not gimmicks
- plan messaging that explains outcome, not just features
- upgrade prompts that appear only when useful
- retention hooks based on saved workflow presets and repeatable templates

## Roadmap

### Phase 1: Core Editing Experience
Goal: make the transcript-first editor feel like a real production tool.

Deliverables:
- draggable timeline trimming
- waveform or thumbnail strip
- tighter transcript and segment sync
- persistent editor state
- improved playback controls

### Phase 2: Export and Delivery
Goal: make the last mile feel reliable and professional.

Deliverables:
- stronger export status UI
- progress and retry handling
- download/share flows
- export presets for common social sizes

### Phase 3: Workflow Retention
Goal: make creators come back because the product gets faster over time.

Deliverables:
- saved edit presets
- reusable caption styles
- project templates
- recent edits and duplicate project flow

### Phase 4: Monetization and Growth
Goal: make the subscription value obvious and sustainable.

Deliverables:
- clearer pricing and plan boundary messaging
- upgrade prompts tied to usage
- billing management flow
- referral or invite mechanics if they fit the product

## Success Criteria
VibeCut is heading in the right direction if:
- a creator can upload and reach an editable timeline quickly
- the editor is faster than manual trimming in a traditional tool for common use cases
- the UI feels calm, premium, and modern on desktop and mobile
- users can understand why the product is paid within one page
- repeat users move faster on their second and third project

## Non-Goals For Now
- general-purpose pro editing parity with Premiere or Resolve
- social network features
- broad template marketplaces before the core workflow is strong
- unnecessary account complexity
- cluttered dashboards or feature bloat

## Implementation Order
If we keep building in the highest-value order, the next work should be:
1. timeline trimming interactions
2. waveform or thumbnail guidance
3. persistent editor state
4. export UX polish
5. retention and pricing refinements

## Practical Next Step
Build the editor interactions first.

The biggest product gap right now is not more marketing copy. It is making the editing surface feel genuinely faster, safer, and more precise than manual editing.