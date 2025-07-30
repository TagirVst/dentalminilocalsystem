import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  Paper,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import { ExitToApp as LogoutIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVisits } from '../contexts/VisitContext';
import VisitCard from '../components/VisitCard';
import ServicesManager from '../components/ServicesManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`manager-tabpanel-${index}`}
      aria-labelledby={`manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { visits, loading, fetchVisits } = useVisits();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentTab === 0) {
      loadVisits();
    }
  }, [currentTab, selectedDate]);

  const loadVisits = async () => {
    try {
      await fetchVisits(selectedDate);
    } catch (err: any) {
      setError('Ошибка загрузки визитов');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
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
            Дашборд управляющего - {user?.name}
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

        <Paper>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="manager tabs">
              <Tab label="Визиты" />
              <Tab label="Управление услугами" />
            </Tabs>
          </Box>

          <TabPanel value={currentTab} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Все визиты
              </Typography>
              
              <TextField
                type="date"
                label="Дата"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Box>

            {/* Сводка по дню */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                Сводка за {new Date(selectedDate).toLocaleDateString('ru-RU')}
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
                  Нет визитов за выбранную дату
                </Typography>
              </Paper>
            ) : (
              <Box>
                {Object.values(visitsByDoctor).map(({ doctor, visits: doctorVisits }) => (
                  <Box key={doctor.id} sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #1976d2', pb: 1 }}>
                      {doctor.name} ({doctorVisits.length} визитов)
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      {doctorVisits.map((visit) => (
                        <VisitCard 
                          key={visit.id} 
                          visit={visit} 
                          userRole="manager"
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <ServicesManager />
          </TabPanel>
        </Paper>
      </Container>
    </>
  );
};

export default ManagerDashboard; 
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  Paper,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import { ExitToApp as LogoutIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVisits } from '../contexts/VisitContext';
import VisitCard from '../components/VisitCard';
import ServicesManager from '../components/ServicesManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`manager-tabpanel-${index}`}
      aria-labelledby={`manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { visits, loading, fetchVisits } = useVisits();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentTab === 0) {
      loadVisits();
    }
  }, [currentTab, selectedDate]);

  const loadVisits = async () => {
    try {
      await fetchVisits(selectedDate);
    } catch (err: any) {
      setError('Ошибка загрузки визитов');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
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
            Дашборд управляющего - {user?.name}
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

        <Paper>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="manager tabs">
              <Tab label="Визиты" />
              <Tab label="Управление услугами" />
            </Tabs>
          </Box>

          <TabPanel value={currentTab} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Все визиты
              </Typography>
              
              <TextField
                type="date"
                label="Дата"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Box>

            {/* Сводка по дню */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                Сводка за {new Date(selectedDate).toLocaleDateString('ru-RU')}
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
                  Нет визитов за выбранную дату
                </Typography>
              </Paper>
            ) : (
              <Box>
                {Object.values(visitsByDoctor).map(({ doctor, visits: doctorVisits }) => (
                  <Box key={doctor.id} sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #1976d2', pb: 1 }}>
                      {doctor.name} ({doctorVisits.length} визитов)
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      {doctorVisits.map((visit) => (
                        <VisitCard 
                          key={visit.id} 
                          visit={visit} 
                          userRole="manager"
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <ServicesManager />
          </TabPanel>
        </Paper>
      </Container>
    </>
  );
};

export default ManagerDashboard; 