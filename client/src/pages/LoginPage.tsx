import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login: authLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Перенаправляем на соответствующий дашборд
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authLogin({ login, password });
      // Перенаправление произойдет автоматически через useEffect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Вход в систему
          </Typography>
          
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
            Резервная система учёта пациентов стоматологии
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="Логин"
              name="login"
              autoComplete="username"
              autoFocus
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Тестовые аккаунты:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Врач: doctor1 / 123456
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Администратор: admin / 123456
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Управляющий: manager / 123456
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login: authLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Перенаправляем на соответствующий дашборд
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authLogin({ login, password });
      // Перенаправление произойдет автоматически через useEffect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Вход в систему
          </Typography>
          
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
            Резервная система учёта пациентов стоматологии
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="Логин"
              name="login"
              autoComplete="username"
              autoFocus
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Тестовые аккаунты:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Врач: doctor1 / 123456
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Администратор: admin / 123456
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Управляющий: manager / 123456
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 