import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { useVisits } from '../contexts/VisitContext';
import { Visit } from '../types';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  visit: Visit;
  onSuccess: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onClose, visit, onSuccess }) => {
  const { updatePayment } = useVisits();
  const [cashPayment, setCashPayment] = useState<string>('');
  const [cardPayment, setCardPayment] = useState<string>('');
  const [transferPayment, setTransferPayment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const parseAmount = (value: string): number => {
    const parsed = parseFloat(value.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  };

  const getTotalPayment = (): number => {
    return parseAmount(cashPayment) + parseAmount(cardPayment) + parseAmount(transferPayment);
  };

  const getPaymentStatus = (): 'unpaid' | 'partial' | 'paid' => {
    const total = getTotalPayment();
    if (total === 0) return 'unpaid';
    if (total >= visit.totalAmount) return 'paid';
    return 'partial';
  };

  const handleSubmit = async () => {
    const totalPayment = getTotalPayment();
    
    if (totalPayment < 0) {
      setError('Сумма оплаты не может быть отрицательной');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updatePayment(visit.id, {
        cashPayment: parseAmount(cashPayment),
        cardPayment: parseAmount(cardPayment),
        transferPayment: parseAmount(transferPayment)
      });

      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка обновления оплаты');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCashPayment('');
    setCardPayment('');
    setTransferPayment('');
    setError('');
    onClose();
  };

  const totalPayment = getTotalPayment();
  const remainingAmount = visit.totalAmount - totalPayment;
  const paymentStatus = getPaymentStatus();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Оплата визита - {visit.patientName}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Сумма к оплате: {formatCurrency(visit.totalAmount)}
          </Typography>
          
          {totalPayment > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Итого к оплате: {formatCurrency(totalPayment)}
              </Typography>
              <Typography 
                variant="body2" 
                color={remainingAmount > 0 ? 'error.main' : 'success.main'}
              >
                {remainingAmount > 0 
                  ? `Остаток: ${formatCurrency(remainingAmount)}`
                  : remainingAmount < 0 
                    ? `Переплата: ${formatCurrency(Math.abs(remainingAmount))}`
                    : 'Полная оплата'
                }
              </Typography>
              <Typography 
                variant="body2" 
                color={paymentStatus === 'paid' ? 'success.main' : paymentStatus === 'partial' ? 'warning.main' : 'error.main'}
              >
                Статус: {paymentStatus === 'paid' ? 'Оплачен' : paymentStatus === 'partial' ? 'Частичная оплата' : 'Не оплачен'}
              </Typography>
            </Box>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Наличные"
              type="number"
              fullWidth
              value={cashPayment}
              onChange={(e) => setCashPayment(e.target.value)}
              disabled={loading}
              inputProps={{ 
                min: 0, 
                step: 0.01,
                placeholder: '0.00'
              }}
              helperText="Сумма оплаты наличными"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Картой"
              type="number"
              fullWidth
              value={cardPayment}
              onChange={(e) => setCardPayment(e.target.value)}
              disabled={loading}
              inputProps={{ 
                min: 0, 
                step: 0.01,
                placeholder: '0.00'
              }}
              helperText="Сумма оплаты картой"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Переводом"
              type="number"
              fullWidth
              value={transferPayment}
              onChange={(e) => setTransferPayment(e.target.value)}
              disabled={loading}
              inputProps={{ 
                min: 0, 
                step: 0.01,
                placeholder: '0.00'
              }}
              helperText="Сумма оплаты переводом"
            />
          </Grid>
        </Grid>

        <Alert severity="warning" sx={{ mt: 2 }}>
          После сохранения оплата не может быть изменена!
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || totalPayment < 0}
        >
          {loading ? <CircularProgress size={20} /> : 'Сохранить оплату'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog; 
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { useVisits } from '../contexts/VisitContext';
import { Visit } from '../types';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  visit: Visit;
  onSuccess: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onClose, visit, onSuccess }) => {
  const { updatePayment } = useVisits();
  const [cashPayment, setCashPayment] = useState<string>('');
  const [cardPayment, setCardPayment] = useState<string>('');
  const [transferPayment, setTransferPayment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const parseAmount = (value: string): number => {
    const parsed = parseFloat(value.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  };

  const getTotalPayment = (): number => {
    return parseAmount(cashPayment) + parseAmount(cardPayment) + parseAmount(transferPayment);
  };

  const getPaymentStatus = (): 'unpaid' | 'partial' | 'paid' => {
    const total = getTotalPayment();
    if (total === 0) return 'unpaid';
    if (total >= visit.totalAmount) return 'paid';
    return 'partial';
  };

  const handleSubmit = async () => {
    const totalPayment = getTotalPayment();
    
    if (totalPayment < 0) {
      setError('Сумма оплаты не может быть отрицательной');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updatePayment(visit.id, {
        cashPayment: parseAmount(cashPayment),
        cardPayment: parseAmount(cardPayment),
        transferPayment: parseAmount(transferPayment)
      });

      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка обновления оплаты');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCashPayment('');
    setCardPayment('');
    setTransferPayment('');
    setError('');
    onClose();
  };

  const totalPayment = getTotalPayment();
  const remainingAmount = visit.totalAmount - totalPayment;
  const paymentStatus = getPaymentStatus();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Оплата визита - {visit.patientName}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Сумма к оплате: {formatCurrency(visit.totalAmount)}
          </Typography>
          
          {totalPayment > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Итого к оплате: {formatCurrency(totalPayment)}
              </Typography>
              <Typography 
                variant="body2" 
                color={remainingAmount > 0 ? 'error.main' : 'success.main'}
              >
                {remainingAmount > 0 
                  ? `Остаток: ${formatCurrency(remainingAmount)}`
                  : remainingAmount < 0 
                    ? `Переплата: ${formatCurrency(Math.abs(remainingAmount))}`
                    : 'Полная оплата'
                }
              </Typography>
              <Typography 
                variant="body2" 
                color={paymentStatus === 'paid' ? 'success.main' : paymentStatus === 'partial' ? 'warning.main' : 'error.main'}
              >
                Статус: {paymentStatus === 'paid' ? 'Оплачен' : paymentStatus === 'partial' ? 'Частичная оплата' : 'Не оплачен'}
              </Typography>
            </Box>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Наличные"
              type="number"
              fullWidth
              value={cashPayment}
              onChange={(e) => setCashPayment(e.target.value)}
              disabled={loading}
              inputProps={{ 
                min: 0, 
                step: 0.01,
                placeholder: '0.00'
              }}
              helperText="Сумма оплаты наличными"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Картой"
              type="number"
              fullWidth
              value={cardPayment}
              onChange={(e) => setCardPayment(e.target.value)}
              disabled={loading}
              inputProps={{ 
                min: 0, 
                step: 0.01,
                placeholder: '0.00'
              }}
              helperText="Сумма оплаты картой"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Переводом"
              type="number"
              fullWidth
              value={transferPayment}
              onChange={(e) => setTransferPayment(e.target.value)}
              disabled={loading}
              inputProps={{ 
                min: 0, 
                step: 0.01,
                placeholder: '0.00'
              }}
              helperText="Сумма оплаты переводом"
            />
          </Grid>
        </Grid>

        <Alert severity="warning" sx={{ mt: 2 }}>
          После сохранения оплата не может быть изменена!
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || totalPayment < 0}
        >
          {loading ? <CircularProgress size={20} /> : 'Сохранить оплату'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog; 