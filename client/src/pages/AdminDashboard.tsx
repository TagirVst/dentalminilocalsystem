import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVisits } from '../contexts/VisitContext';
import VisitCard from '../components/VisitCard';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { visits, loading, fetchVisits } = useVisits();
  const [selectedDay, setSelectedDay] = useState<'today' | 'yesterday'>('today');
  const [error, setError] = useState('');

  useEffect(() => {
    loadVisits();
  }, [selectedDay]);

  const loadVisits = async () => {
    try {
      const today = new Date();
      let targetDate: Date;

      if (selectedDay === 'today') {
        targetDate = today;
      } else {
        targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() - 1);
      }

      const dateString = targetDate.toISOString().split('T')[0];
      await fetchVisits(dateString);
    } catch (err: any) {
      setError('Ошибка загрузки визитов');
    }
  };

  const handleDayChange = (event: React.MouseEvent<HTMLElement>, newDay: 'today' | 'yesterday') => {
    if (newDay !== null) {
      setSelectedDay(newDay);
    }
  };

  const handlePaymentUpdate = () => {
    loadVisits(); // Перезагружаем визиты после обновления оплаты
  };

  const handleLogout = () => {
    logout();
  };

  // Группируем визиты по врачам
  const visitsByDoctor = visits.reduce((acc, visit) => {
    const doctorId = visit.doctor.id;
    if (!acc[doctorId]) {
      acc[doctorId] = {
        doctor: visit.doctor,
        visits: []
      };
    }
    acc[doctorId].visits.push(visit);
    return acc;
  }, {} as Record<number, { doctor: any; visits: any[] }>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const calculateDayTotals = () => {
    const totalAmount = visits.reduce((sum, visit) => sum + visit.totalAmount, 0);
    const paidAmount = visits.reduce((sum, visit) => {
      if (visit.paymentStatus === 'paid') return sum + visit.totalAmount;
      if (visit.paymentStatus === 'partial') {
        return sum + visit.cashPayment + visit.cardPayment + visit.transferPayment;
      }
      return sum;
    }, 0);
    const unpaidAmount = totalAmount - paidAmount;

    return { totalAmount, paidAmount, unpaidAmount };
  };

  const dayTotals = calculateDayTotals();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Дашборд администратора - {user?.name}
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
            Визиты за {selectedDay === 'today' ? 'сегодня' : 'вчера'}
          </Typography>
          
          <ToggleButtonGroup
            value={selectedDay}
            exclusive
            onChange={handleDayChange}
            aria-label="выбор дня"
          >
            <ToggleButton value="today" aria-label="сегодня">
              Сегодня
            </ToggleButton>
            <ToggleButton value="yesterday" aria-label="вчера">
              Вчера
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Сводка по дню */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Сводка за день
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Всего визитов
              </Typography>
              <Typography variant="h6">
                {visits.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Общая сумма
              </Typography>
              <Typography variant="h6">
                {formatCurrency(dayTotals.totalAmount)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Оплачено
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(dayTotals.paidAmount)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Долг
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(dayTotals.unpaidAmount)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : Object.keys(visitsByDoctor).length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Нет визитов за выбранный день
            </Typography>
          </Paper>
        ) : (
          <Box>
            {Object.values(visitsByDoctor).map(({ doctor, visits: doctorVisits }) => (
              <Box key={doctor.id} sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ borderBottom: '2px solid #1976d2', pb: 1 }}>
                  {doctor.name} ({doctorVisits.length} визитов)
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {doctorVisits.map((visit) => (
                    <VisitCard 
                      key={visit.id} 
                      visit={visit} 
                      userRole="admin" 
                      onPaymentUpdate={handlePaymentUpdate}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
};

export default AdminDashboard; 
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVisits } from '../contexts/VisitContext';
import VisitCard from '../components/VisitCard';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { visits, loading, fetchVisits } = useVisits();
  const [selectedDay, setSelectedDay] = useState<'today' | 'yesterday'>('today');
  const [error, setError] = useState('');

  useEffect(() => {
    loadVisits();
  }, [selectedDay]);

  const loadVisits = async () => {
    try {
      const today = new Date();
      let targetDate: Date;

      if (selectedDay === 'today') {
        targetDate = today;
      } else {
        targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() - 1);
      }

      const dateString = targetDate.toISOString().split('T')[0];
      await fetchVisits(dateString);
    } catch (err: any) {
      setError('Ошибка загрузки визитов');
    }
  };

  const handleDayChange = (event: React.MouseEvent<HTMLElement>, newDay: 'today' | 'yesterday') => {
    if (newDay !== null) {
      setSelectedDay(newDay);
    }
  };

  const handlePaymentUpdate = () => {
    loadVisits(); // Перезагружаем визиты после обновления оплаты
  };

  const handleLogout = () => {
    logout();
  };

  // Группируем визиты по врачам
  const visitsByDoctor = visits.reduce((acc, visit) => {
    const doctorId = visit.doctor.id;
    if (!acc[doctorId]) {
      acc[doctorId] = {
        doctor: visit.doctor,
        visits: []
      };
    }
    acc[doctorId].visits.push(visit);
    return acc;
  }, {} as Record<number, { doctor: any; visits: any[] }>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const calculateDayTotals = () => {
    const totalAmount = visits.reduce((sum, visit) => sum + visit.totalAmount, 0);
    const paidAmount = visits.reduce((sum, visit) => {
      if (visit.paymentStatus === 'paid') return sum + visit.totalAmount;
      if (visit.paymentStatus === 'partial') {
        return sum + visit.cashPayment + visit.cardPayment + visit.transferPayment;
      }
      return sum;
    }, 0);
    const unpaidAmount = totalAmount - paidAmount;

    return { totalAmount, paidAmount, unpaidAmount };
  };

  const dayTotals = calculateDayTotals();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Дашборд администратора - {user?.name}
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
            Визиты за {selectedDay === 'today' ? 'сегодня' : 'вчера'}
          </Typography>
          
          <ToggleButtonGroup
            value={selectedDay}
            exclusive
            onChange={handleDayChange}
            aria-label="выбор дня"
          >
            <ToggleButton value="today" aria-label="сегодня">
              Сегодня
            </ToggleButton>
            <ToggleButton value="yesterday" aria-label="вчера">
              Вчера
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Сводка по дню */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Сводка за день
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Всего визитов
              </Typography>
              <Typography variant="h6">
                {visits.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Общая сумма
              </Typography>
              <Typography variant="h6">
                {formatCurrency(dayTotals.totalAmount)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Оплачено
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(dayTotals.paidAmount)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Долг
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(dayTotals.unpaidAmount)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : Object.keys(visitsByDoctor).length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Нет визитов за выбранный день
            </Typography>
          </Paper>
        ) : (
          <Box>
            {Object.values(visitsByDoctor).map(({ doctor, visits: doctorVisits }) => (
              <Box key={doctor.id} sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ borderBottom: '2px solid #1976d2', pb: 1 }}>
                  {doctor.name} ({doctorVisits.length} визитов)
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {doctorVisits.map((visit) => (
                    <VisitCard 
                      key={visit.id} 
                      visit={visit} 
                      userRole="admin" 
                      onPaymentUpdate={handlePaymentUpdate}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
};

export default AdminDashboard; 