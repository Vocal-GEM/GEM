1. **Target**: Add missing accessibility attributes (`aria-label`, `aria-expanded`, and keyboard focus handling) to the "Info" icon tooltip buttons in `src/components/viz/BrightnessMeter.jsx` and `src/components/viz/FlowFinisher.jsx`.
2. **Implementation Strategy**:
   - `src/components/viz/BrightnessMeter.jsx`: Update the info button to include `aria-label="More info about Brightness Meter"`, `aria-expanded={showTooltip}`, and `onFocus`/`onBlur` handlers alongside `onMouseEnter`/`onMouseLeave` to support keyboard navigation.
   - `src/components/viz/FlowFinisher.jsx`: Update the info button to include `aria-label="More info about Flow Finisher"`, `aria-expanded={showTooltip}`, and `onFocus`/`onBlur` handlers.
3. **Verify Changes**:
   - Ensure `npm run lint` passes without warnings in these files.
4. **Pre-commit**:
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
5. **Submit PR**:
   - Create a PR with title "🎨 Palette: [Add accessibility to info tooltips in viz components]" and description following Palette's template.
