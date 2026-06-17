---
name: add-creation-type
description: Automates adding a new creation type.
---

# Context

This skill automates the process of adding a new creation type to the builder. It guides you through setting up the required stores, EditorBar components, and Preview components.

---

# AI Workflow for Adding a New Creation Type

## Step 1: Gather Requirements

Prompt the user to describe the new creation type, and ask if this will require a new setup (store, EditorBar, Preview components) or if it can be added to existing pieces.

## Step 2: Constants

Create a new constant value in @/constants/creatorTypes.js and add it to the ALL array. Ask if it should be added to other groups.

## Step 3: Stores

If a new store needs to be created, create a pinia store in @/stores. Otherwise, use the previously designated store. The naming pattern is `<featureName>.store.js`

Update the store with new values and methods.

## Step 4: Editor Bar

If a new EditorBar component needs to be created, create the component in @/components/EditorBar. The naming pattern is `EditorBar<FeatureName>.vue`.

Use Base components found in @components/common to establish inputs. If a required field does not have a matching input, prompt the user to either create a new Base component or to hardcode it with straight html, etc.

Wire the inputs to the store.

## Step 5: Preview

If a new Preview component needs to be created, create the component in @/components/Preview. The naming pattern is `Preview<FeatureName>.vue`. If several components are needed for this feature, put them in a folder. Otherwise it can stay at the top level.

Prompt the user to describe the preview layout and any functional pieces.

Wire the ui elements to the store.

**CRITICAL:** Preview components must scale well to the user's screen size.

See `@/components/Preview/PreviewCards/PreviewCard.vue` for the established patterns. Key techniques used there:

- **`container-type: inline-size`** on the root element — makes the card a CSS Container Query container so `cqw` units throughout are relative to the card's own width, not the viewport. Every font size and image width then scales automatically as the card grows or shrinks.
- **`%` for positioning, `cqw` for font sizes** — e.g. `.name-text { font-size: calc(5cqw * var(--name-fit-scale, 1)) }`, `.credits { font-size: 2cqw }`. Never use `px` for anything that should scale.
- **`aspect-ratio`** on the root element — keeps proportions locked as the container resizes.
- **`max-height` with a media query** — e.g. `max-height: 100vh` on desktop, `max-height: calc(80vh - 120px)` on small screens so the card never overflows the viewport behind the EditBar.
- **JavaScript fit-scaling for text overflow** — a `ResizeObserver` watches bounded text boxes and iteratively decrements a CSS custom property (`--fit-scale` / `--name-fit-scale`) until the text fits. Font sizes are written as `calc(NcqW * var(--fit-scale, 1))` so the base always tracks the card width, and the JS variable only kicks in when content would otherwise overflow. Re-runs on every resize and after `document.fonts.ready` since font metrics affect layout.

## Step 6: Saving Work

The user must be able to save and share their work. Url queries are used to handle this data. See @/utils/serializeState.js and @/stores/card.store.js > setFromParams for an example.

Wire up @/components/Files/FilesModal.vue to handle saving the project.

## Step 7: Downloading

Make sure the user can download their work from the Share bar.

## Step 8: Review

Review the created/modified components and double-check that the data flows from the store to the EditorBar and the Preview correctly.

Make sure existing features still work exactly as they did before, unless modification was intended.
