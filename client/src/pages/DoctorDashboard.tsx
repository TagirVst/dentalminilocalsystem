import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Fab,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVisits } from '../contexts/VisitContext';
import VisitCard from '../components/VisitCard';
import CreateVisitDialog from '../components/CreateVisitDialog';

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { visits, loading, fetchVisits } = useVisits();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTodayVisits();
  }, []);

  const loadTodayVisits = async () => {
    try {
      await fetchVisits(); // По умолчанию загружает визиты за сегодня
    } catch (err: any) {
      setError('Ошибка загрузки визитов');
    }
  };

  const handleCreateVisit = () => {
    setCreateDialogOpen(true);
  };

  const handleVisitCreated = () => {
    setCreateDialogOpen(false);
    loadTodayVisits(); // Обновляем список визитов
  };

  const handleLogout = () => {
    logout();
  };

  const todayVisits = visits.filter(visit => 
    new Date(visit.visitDate).toDateString() === new Date().toDateString()
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Дашборд врача - {user?.name}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Выход
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Мои визиты на сегодня
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateVisit}
          >
            Новый визит
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : todayVisits.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" textAlign="center" color="textSecondary">
                У вас пока нет визитов на сегодня
              </Typography>
              <Typography variant="body2" textAlign="center" color="textSecondary" sx={{ mt: 1 }}>
                Нажмите "Новый визит" чтобы добавить первый
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {todayVisits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} userRole="doctor" />
            ))}
          </Box>
        )}

        {/* Floating Action Button для создания визита */}
        <Fab
          color="primary"
          aria-label="добавить визит"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateVisit}
        >
          <AddIcon />
        </Fab>
      </Container>

      <CreateVisitDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleVisitCreated}
      />
    </>
  );
};

export default DoctorDashboard; 
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Fab,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVisits } from '../contexts/VisitContext';
import VisitCard from '../components/VisitCard';
import CreateVisitDialog from '../components/CreateVisitDialog';

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { visits, loading, fetchVisits } = useVisits();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTodayVisits();
  }, []);

  const loadTodayVisits = async () => {
    try {
      await fetchVisits(); // По умолчанию загружает визиты за сегодня
    } catch (err: any) {
      setError('Ошибка загрузки визитов');
    }
  };

  const handleCreateVisit = () => {
    setCreateDialogOpen(true);
  };

  const handleVisitCreated = () => {
    setCreateDialogOpen(false);
    loadTodayVisits(); // Обновляем список визитов
  };

  const handleLogout = () => {
    logout();
  };

  const todayVisits = visits.filter(visit => 
    new Date(visit.visitDate).toDateString() === new Date().toDateString()
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Дашборд врача - {user?.name}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Выход
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Мои визиты на сегодня
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateVisit}
          >
            Новый визит
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : todayVisits.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" textAlign="center" color="textSecondary">
                У вас пока нет визитов на сегодня
              </Typography>
              <Typography variant="body2" textAlign="center" color="textSecondary" sx={{ mt: 1 }}>
                Нажмите "Новый визит" чтобы добавить первый
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {todayVisits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} userRole="doctor" />
            ))}
          </Box>
        )}

        {/* Floating Action Button для создания визита */}
        <Fab
          color="primary"
          aria-label="добавить визит"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateVisit}
        >
          <AddIcon />
        </Fab>
      </Container>

      <CreateVisitDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleVisitCreated}
      />
    </>
  );
};

export default DoctorDashboard; 