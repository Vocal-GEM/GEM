# Testing Checklist - Vocal GEM

## Pre-Deployment Testing

### Environment Setup
- [ ] Frontend `.env` file created with correct `VITE_API_URL`
- [ ] Backend `.env` file created with all required variables
- [ ] `SECRET_KEY` changed from default
- [ ] `GEMINI_API_KEY` configured (if using AI Coach)
- [ ] Database connection string correct

---

## Backend Testing

### Database
- [ ] Database tables created successfully
  - [ ] `user` table exists
  - [ ] `journal` table exists with new fields (mood, tags, client_id)
  - [ ] `stats` table exists with high_scores field
  - [ ] `settings` table exists
- [ ] Can create new user account
- [ ] Can log in with existing account
- [ ] Session persists across requests

### API Endpoints
- [ ] `POST /api/signup` - Creates new user
- [ ] `POST /api/login` - Returns user data and sets session
- [ ] `POST /api/logout` - Clears session
- [ ] `GET /api/check-auth` - Returns current user
- [ ] `POST /api/sync` - Accepts queue and processes items
- [ ] `GET /api/data` - Returns user data (stats, journals, settings)
- [ ] `POST /api/chat` - AI Coach responds (if API key configured)
- [ ] `POST /api/upload` - Handles file uploads

### Sync System
- [ ] Stats sync correctly (totalPoints, totalSeconds, level, highScores)
- [ ] Journal sync correctly (all fields including mood, tags)
- [ ] Settings sync correctly
- [ ] Duplicate journals are prevented (client_id check)
- [ ] Max values are preserved (stats don't regress)

---

## Frontend Testing

### Core Features
- [ ] App loads without errors
- [ ] Audio engine initializes
- [ ] Microphone permission requested
- [ ] Audio visualization works
- [ ] Pitch detection accurate
- [ ] Resonance detection works
- [ ] Formant (F1/F2) detection works

### Games
- [ ] **Flappy Voice Game**
  - [ ] Loads correctly
  - [ ] Pitch control works
  - [ ] Score increments
  - [ ] Best score saved
  - [ ] Particles appear on score
  - [ ] Game over works
  - [ ] Restart works
- [ ] **Resonance River Game**
  - [ ] Loads correctly
  - [ ] Lane switching works
  - [ ] Stars collectible
  - [ ] Rocks cause game over
  - [ ] Particles on lane change
  - [ ] Score syncs
- [ ] **Pitch Match Game**
  - [ ] Loads correctly
  - [ ] Notes spawn
  - [ ] Hit detection works
  - [ ] Floating score text appears
  - [ ] Combo system works
  - [ ] "Perfect!" text on high combo

### AI Coach
- [ ] Chat interface loads
- [ ] Can send messages
- [ ] Receives responses (if API key configured)
- [ ] Context includes stats
- [ ] Context includes recent journals
- [ ] Clear chat button works
- [ ] Offline mode shows appropriate message

### Data Persistence
- [ ] Settings save to IndexedDB
- [ ] Journals save to IndexedDB
- [ ] Stats save to IndexedDB
- [ ] High scores save to IndexedDB
- [ ] Data persists after page reload
- [ ] Profile switching works

---

## Sync Testing (Critical!)

### Offline Mode
- [ ] Go offline (disable network)
- [ ] Create journal entry
- [ ] Play game and get score
- [ ] Change settings
- [ ] Verify items added to sync queue
- [ ] Go back online
- [ ] Verify automatic sync triggers
- [ ] Verify items removed from queue after sync
- [ ] Check backend database for synced data

### Online Mode
- [ ] Create journal while online
- [ ] Verify immediate sync (check network tab)
- [ ] Play game while online
- [ ] Verify score syncs within 2 seconds
- [ ] Change settings while online
- [ ] Verify settings sync within 1 second

### Cross-Device Sync
- [ ] Log in on Device A
- [ ] Create data (journal, play game)
- [ ] Log in on Device B (different browser/device)
- [ ] Verify data appears on Device B
- [ ] Create data on Device B
- [ ] Refresh Device A
- [ ] Verify data from Device B appears

---

## Error Handling

### Error Boundaries
- [ ] Trigger React error (modify code to throw)
- [ ] Verify GlobalErrorBoundary catches it
- [ ] Verify user-friendly error message shown
- [ ] Verify "Try Again" button works
- [ ] Verify "Reload App" button works

### Network Errors
- [ ] Disable network during sync
- [ ] Verify items stay in queue
- [ ] Verify retry mechanism works
- [ ] Enable network
- [ ] Verify sync completes

### API Errors
- [ ] Test with invalid API key
- [ ] Verify AI Coach shows appropriate message
- [ ] Test with wrong credentials
- [ ] Verify login error shown
- [ ] Test sync with server down
- [ ] Verify graceful degradation

---

## Mobile Testing (If Deploying Mobile)

### Android
- [ ] Build APK successfully
- [ ] Install on device
- [ ] App launches
- [ ] Safe areas respected (notch, home indicator)
- [ ] Touch targets appropriate size
- [ ] No tap highlights
- [ ] No text selection on UI elements
- [ ] Keyboard behavior correct
- [ ] Audio permissions work
- [ ] Camera permissions work (if using)
- [ ] All games playable
- [ ] Sync works

### iOS
- [ ] Build IPA successfully
- [ ] Install on device
- [ ] App launches
- [ ] Safe areas respected
- [ ] Touch interactions smooth
- [ ] Audio permissions work
- [ ] All features work

---

## Performance Testing

### Load Times
- [ ] Initial load < 3 seconds
- [ ] Audio engine starts < 1 second
- [ ] Games load instantly
- [ ] No lag during gameplay

### Memory
- [ ] No memory leaks during extended use
- [ ] Audio engine doesn't consume excessive memory
- [ ] Games clean up properly on close

### Battery (Mobile)
- [ ] Reasonable battery usage
- [ ] Audio processing optimized
- [ ] No excessive wake locks

---

## Security Testing

### Authentication
- [ ] Cannot access protected routes without login
- [ ] Session expires appropriately
- [ ] Logout clears session completely
- [ ] Cannot access other users' data

### CORS
- [ ] Requests from allowed origins work
- [ ] Requests from disallowed origins blocked (in production)

### Headers
- [ ] Security headers present in responses
- [ ] CSP policy appropriate
- [ ] HTTPS redirect works (in production)

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Can navigate with Tab key
- [ ] Focus indicators visible
- [ ] Can activate buttons with Enter/Space

### Screen Readers
- [ ] Important elements have labels
- [ ] Error messages announced
- [ ] Status changes announced

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Post-Deployment Verification

### Production Environment
- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Database connected
- [ ] Environment variables set correctly
- [ ] HTTPS working
- [ ] CORS configured for production domain
- [ ] Logs accessible
- [ ] Monitoring set up

### Smoke Tests
- [ ] Can sign up
- [ ] Can log in
- [ ] Can create journal
- [ ] Can play game
- [ ] Can use AI Coach
- [ ] Sync works
- [ ] Data persists

---

## Regression Testing (After Updates)

- [ ] All core features still work
- [ ] No new console errors
- [ ] Build succeeds
- [ ] Sync still works
- [ ] Authentication still works

---

## Known Issues / Limitations

Document any known issues here:
- 
- 
- 

---

## Sign-Off

**Tested By**: _______________
**Date**: _______________
**Environment**: [ ] Development [ ] Staging [ ] Production
**Status**: [ ] Pass [ ] Fail [ ] Pass with Issues

**Notes**:
