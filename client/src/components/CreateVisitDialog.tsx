import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Autocomplete,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useVisits } from '../contexts/VisitContext';
import { Service } from '../types';

interface CreateVisitDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedService {
  service: Service;
  quantity: number;
}

const CreateVisitDialog: React.FC<CreateVisitDialogProps> = ({ open, onClose, onSuccess }) => {
  const { services, fetchServices, createVisit } = useVisits();
  const [patientName, setPatientName] = useState('');
  const [comment, setComment] = useState('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [serviceToAdd, setServiceToAdd] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open, fetchServices]);

  const handleAddService = () => {
    if (serviceToAdd && !selectedServices.find(s => s.service.id === serviceToAdd.id)) {
      setSelectedServices(prev => [...prev, { service: serviceToAdd, quantity: 1 }]);
      setServiceToAdd(null);
    }
  };

  const handleRemoveService = (serviceId: number) => {
    setSelectedServices(prev => prev.filter(s => s.service.id !== serviceId));
  };

  const handleQuantityChange = (serviceId: number, quantity: number) => {
    if (quantity > 0) {
      setSelectedServices(prev => 
        prev.map(s => s.service.id === serviceId ? { ...s, quantity } : s)
      );
    }
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, item) => 
      total + (item.service.currentPrice * item.quantity), 0
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!patientName.trim()) {
      setError('ФИО пациента обязательно');
      return;
    }

    if (selectedServices.length === 0) {
      setError('Выберите хотя бы одну услугу');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createVisit({
        patientName: patientName.trim(),
        comment: comment.trim() || undefined,
        services: selectedServices.map(item => ({
          serviceId: item.service.id,
          quantity: item.quantity
        }))
      });

      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка создания визита');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPatientName('');
    setComment('');
    setSelectedServices([]);
    setServiceToAdd(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Создать новый визит</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="ФИО пациента"
            fullWidth
            required
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            disabled={loading}
          />

          <Box>
            <Typography variant="h6" gutterBottom>
              Услуги
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Autocomplete
                options={services}
                getOptionLabel={(option) => `${option.name} - ${formatCurrency(option.currentPrice)}`}
                groupBy={(option) => option.group.name}
                value={serviceToAdd}
                onChange={(_, value) => setServiceToAdd(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Выберите услугу" sx={{ minWidth: 300 }} />
                )}
                disabled={loading}
                sx={{ flex: 1 }}
              />
              <IconButton 
                onClick={handleAddService} 
                disabled={!serviceToAdd || loading}
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </Box>

            {selectedServices.length > 0 && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Услуга</TableCell>
                    <TableCell align="center">Количество</TableCell>
                    <TableCell align="right">Цена</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                    <TableCell align="center">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedServices.map((item) => (
                    <TableRow key={item.service.id}>
                      <TableCell>{item.service.name}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.service.id, parseInt(e.target.value) || 1)}
                          size="small"
                          sx={{ width: 80 }}
                          inputProps={{ min: 1 }}
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.service.currentPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.service.currentPrice * item.quantity)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          onClick={() => handleRemoveService(item.service.id)}
                          size="small"
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Итого:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatCurrency(calculateTotal())}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </Box>

          <TextField
            label="Комментарий"
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !patientName.trim() || selectedServices.length === 0}
        >
          {loading ? <CircularProgress size={20} /> : 'Создать визит'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateVisitDialog; 
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Autocomplete,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useVisits } from '../contexts/VisitContext';
import { Service } from '../types';

interface CreateVisitDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedService {
  service: Service;
  quantity: number;
}

const CreateVisitDialog: React.FC<CreateVisitDialogProps> = ({ open, onClose, onSuccess }) => {
  const { services, fetchServices, createVisit } = useVisits();
  const [patientName, setPatientName] = useState('');
  const [comment, setComment] = useState('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [serviceToAdd, setServiceToAdd] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open, fetchServices]);

  const handleAddService = () => {
    if (serviceToAdd && !selectedServices.find(s => s.service.id === serviceToAdd.id)) {
      setSelectedServices(prev => [...prev, { service: serviceToAdd, quantity: 1 }]);
      setServiceToAdd(null);
    }
  };

  const handleRemoveService = (serviceId: number) => {
    setSelectedServices(prev => prev.filter(s => s.service.id !== serviceId));
  };

  const handleQuantityChange = (serviceId: number, quantity: number) => {
    if (quantity > 0) {
      setSelectedServices(prev => 
        prev.map(s => s.service.id === serviceId ? { ...s, quantity } : s)
      );
    }
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, item) => 
      total + (item.service.currentPrice * item.quantity), 0
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!patientName.trim()) {
      setError('ФИО пациента обязательно');
      return;
    }

    if (selectedServices.length === 0) {
      setError('Выберите хотя бы одну услугу');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createVisit({
        patientName: patientName.trim(),
        comment: comment.trim() || undefined,
        services: selectedServices.map(item => ({
          serviceId: item.service.id,
          quantity: item.quantity
        }))
      });

      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка создания визита');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPatientName('');
    setComment('');
    setSelectedServices([]);
    setServiceToAdd(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Создать новый визит</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="ФИО пациента"
            fullWidth
            required
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            disabled={loading}
          />

          <Box>
            <Typography variant="h6" gutterBottom>
              Услуги
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Autocomplete
                options={services}
                getOptionLabel={(option) => `${option.name} - ${formatCurrency(option.currentPrice)}`}
                groupBy={(option) => option.group.name}
                value={serviceToAdd}
                onChange={(_, value) => setServiceToAdd(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Выберите услугу" sx={{ minWidth: 300 }} />
                )}
                disabled={loading}
                sx={{ flex: 1 }}
              />
              <IconButton 
                onClick={handleAddService} 
                disabled={!serviceToAdd || loading}
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </Box>

            {selectedServices.length > 0 && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Услуга</TableCell>
                    <TableCell align="center">Количество</TableCell>
                    <TableCell align="right">Цена</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                    <TableCell align="center">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedServices.map((item) => (
                    <TableRow key={item.service.id}>
                      <TableCell>{item.service.name}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.service.id, parseInt(e.target.value) || 1)}
                          size="small"
                          sx={{ width: 80 }}
                          inputProps={{ min: 1 }}
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.service.currentPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.service.currentPrice * item.quantity)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          onClick={() => handleRemoveService(item.service.id)}
                          size="small"
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Итого:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatCurrency(calculateTotal())}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </Box>

          <TextField
            label="Комментарий"
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !patientName.trim() || selectedServices.length === 0}
        >
          {loading ? <CircularProgress size={20} /> : 'Создать визит'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateVisitDialog; 