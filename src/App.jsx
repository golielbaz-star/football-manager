import { useState, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import { useGameSession } from './hooks/useGameSession'
import { useRealtime } from './hooks/useRealtime'
import { createGroup } from './services/groupService'
import { registerPlayer } from './services/authService'
import LoginForm from './components/auth/LoginForm'
import OnboardingForm from './components/auth/OnboardingForm'
import CreateGroupForm from './components/auth/CreateGroupForm'
import HomeScreen from './components/home/HomeScreen'
import RSVPScreen from './components/rsvp/RSVPScreen'
import TeamGenerator from './components/teams/TeamGenerator'
import AdminScreen from './components/admin/AdminScreen'
import Layout from './components/shared/Layout'
import BottomNav from './components/shared/BottomNav'

const PAGE_TITLES = {
  home: { title: '⚽ כדורגל שכונתי', subtitle: null },
  rsvp: { title: 'אישורי הגעה', subtitle: 'מי מגיע למשחק?' },
  teams: { title: 'חלוקת קבוצות', subtitle: 'אלגוריתם חכם לאיזון' },
  admin: { title: 'ניהול קבוצה', subtitle: null },
}

export default function App() {
  const { session, loading: authLoading, error: authError, login, completeOnboarding, logout } = useAuth()
  const [pendingLogin, setPendingLogin] = useState(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [createGroupError, setCreateGroupError] = useState(null)
  const [createGroupLoading, setCreateGroupLoading] = useState(false)
  const [activePage, setActivePage] = useState('home')

  const {
    session: gameSession,
    rsvps,
    myRsvp,
    loading: sessionLoading,
    refresh,
    submitRSVP,
    toggleArrived,
  } = useGameSession(session?.group, session?.player?.id)

  useRealtime(
    'rsvps',
    gameSession ? `session_id=eq.${gameSession.id}` : null,
    () => { if (gameSession) refresh() }
  )

  const handleLogin = useCallback(async (creds) => {
    const result = await login(creds)
    if (result.isNew) {
      setPendingLogin(creds)
    }
  }, [login])

  const handleOnboarding = useCallback(async (data) => {
    await completeOnboarding(data)
    setPendingLogin(null)
  }, [completeOnboarding])

  const handleCreateGroup = useCallback(async (groupData) => {
    setCreateGroupLoading(true)
    setCreateGroupError(null)
    try {
      const group = await createGroup(groupData)
      // Auto-register admin as player
      const player = await registerPlayer({
        phone: groupData.admin_phone,
        adminPhone: groupData.admin_phone,
        name: groupData.admin_name,
        age: 30,
        fitness_level: 3,
        skill_level: 3,
        is_goalkeeper: false,
      })
      const sess = { player, group, isAdmin: true }
      localStorage.setItem('football_session', JSON.stringify(sess))
      window.location.reload()
    } catch (e) {
      const msg = e.message || ''
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setCreateGroupError('מספר טלפון זה כבר רשום כמנהל קבוצה. נסה להיכנס עם הטלפון שלך.')
      } else {
        setCreateGroupError('שגיאה ביצירת הקבוצה, נסה שוב')
      }
    } finally {
      setCreateGroupLoading(false)
    }
  }, [])

  if (authLoading && !session) {
    return (
      <div className="min-h-screen bg-green-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⚽</div>
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!session && showCreateGroup) {
    return (
      <CreateGroupForm
        onBack={() => setShowCreateGroup(false)}
        onCreate={handleCreateGroup}
        loading={createGroupLoading}
        error={createGroupError}
      />
    )
  }

  if (!session && pendingLogin) {
    return (
      <OnboardingForm
        phone={pendingLogin.phone}
        adminPhone={pendingLogin.adminPhone}
        onComplete={handleOnboarding}
        loading={authLoading}
      />
    )
  }

  if (!session) {
    return (
      <LoginForm
        onLogin={handleLogin}
        loading={authLoading}
        error={authError}
        onCreateGroup={() => setShowCreateGroup(true)}
      />
    )
  }

  const { title, subtitle } = PAGE_TITLES[activePage]

  return (
    <Layout title={title} subtitle={subtitle}>
      {activePage === 'home' && (
        <HomeScreen
          session={session}
          upcomingSession={gameSession}
          rsvps={rsvps}
          onNavigate={setActivePage}
        />
      )}
      {activePage === 'rsvp' && (
        <RSVPScreen
          session={gameSession}
          rsvps={rsvps}
          myRsvp={myRsvp}
          player={session.player}
          isAdmin={session.isAdmin}
          onRSVP={submitRSVP}
          onToggleArrived={toggleArrived}
          loading={sessionLoading}
        />
      )}
      {activePage === 'teams' && (
        <TeamGenerator
          session={gameSession}
          group={session.group}
          rsvps={rsvps}
        />
      )}
      {activePage === 'admin' && (
        <AdminScreen
          group={session.group}
          gameSession={gameSession}
          onSessionCreated={refresh}
          onNavigateToTeams={() => setActivePage('teams')}
        />
      )}
      <BottomNav active={activePage} onNavigate={setActivePage} onLogout={logout} isAdmin={session.isAdmin} />
    </Layout>
  )
}
