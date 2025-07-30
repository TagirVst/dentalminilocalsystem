import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Alert,
  CircularProgress,
  Autocomplete,
  Paper,
  InputAdornment,
  TableContainer
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { useVisits } from '../contexts/VisitContext';
import { servicesAPI } from '../services/api';

const ServicesManager: React.FC = () => {
  const { services, serviceGroups, fetchServices, fetchServiceGroups, updateServicePrice } = useVisits();
  const [searchTerm, setSearchTerm] = useState('');
  const [createServiceDialogOpen, setCreateServiceDialogOpen] = useState(false);
  const [updatePriceDialogOpen, setUpdatePriceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchServices(),
        fetchServiceGroups()
      ]);
    } catch (err: any) {
      setError('Ошибка загрузки данных');
    }
  };

  const handleSearch = async () => {
    try {
      await fetchServices(searchTerm || undefined);
    } catch (err: any) {
      setError('Ошибка поиска услуг');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const handleEditPrice = (service: any) => {
    setSelectedService(service);
    setUpdatePriceDialogOpen(true);
  };

  const groupedServices = services.reduce((acc, service) => {
    const groupName = service.group.name;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(service);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Управление услугами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateServiceDialogOpen(true)}
        >
          Добавить услугу
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Поиск услуг"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Найти
        </Button>
        <Button variant="outlined" onClick={() => { setSearchTerm(''); fetchServices(); }}>
          Сбросить
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : Object.keys(groupedServices).length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Услуги не найдены
          </Typography>
        </Paper>
      ) : (
        <Box>
          {Object.entries(groupedServices).map(([groupName, groupServices]) => (
            <Box key={groupName} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #ddd', pb: 1 }}>
                {groupName} ({groupServices.length} услуг)
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название услуги</TableCell>
                      <TableCell>Подгруппа</TableCell>
                      <TableCell align="right">Цена</TableCell>
                      <TableCell align="center">Дата изменения</TableCell>
                      <TableCell align="center">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.subgroup?.name || '—'}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold">
                            {formatCurrency(service.currentPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {formatDate(service.priceUpdatedAt)}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditPrice(service)}
                          >
                            Изменить цену
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      )}

      <CreateServiceDialog
        open={createServiceDialogOpen}
        onClose={() => setCreateServiceDialogOpen(false)}
        serviceGroups={serviceGroups}
        onSuccess={() => {
          setCreateServiceDialogOpen(false);
          loadData();
        }}
      />

      <UpdatePriceDialog
        open={updatePriceDialogOpen}
        onClose={() => setUpdatePriceDialogOpen(false)}
        service={selectedService}
        onSuccess={() => {
          setUpdatePriceDialogOpen(false);
          loadData();
        }}
      />
    </Box>
  );
};

// Диалог создания услуги
interface CreateServiceDialogProps {
  open: boolean;
  onClose: () => void;
  serviceGroups: any[];
  onSuccess: () => void;
}

const CreateServiceDialog: React.FC<CreateServiceDialogProps> = ({ open, onClose, serviceGroups, onSuccess }) => {
  const [name, setName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<any>(null);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !selectedGroup || !price) {
      setError('Заполните все обязательные поля');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Цена должна быть положительным числом');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await servicesAPI.createService({
        name: name.trim(),
        groupId: selectedGroup.id,
        subgroupId: selectedSubgroup?.id,
        currentPrice: priceNum
      });

      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка создания услуги');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedGroup(null);
    setSelectedSubgroup(null);
    setPrice('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить новую услугу</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Название услуги"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <Autocomplete
            options={serviceGroups}
            getOptionLabel={(option) => option.name}
            value={selectedGroup}
            onChange={(_, value) => {
              setSelectedGroup(value);
              setSelectedSubgroup(null);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Группа услуг" required />
            )}
            disabled={loading}
          />

          {selectedGroup && selectedGroup.subgroups && (
            <Autocomplete
              options={selectedGroup.subgroups}
              getOptionLabel={(option) => option.name}
              value={selectedSubgroup}
              onChange={(_, value) => setSelectedSubgroup(value)}
              renderInput={(params) => (
                <TextField {...params} label="Подгруппа (необязательно)" />
              )}
              disabled={loading}
            />
          )}

          <TextField
            label="Цена"
            type="number"
            fullWidth
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
            inputProps={{ min: 0, step: 0.01 }}
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
          disabled={loading || !name.trim() || !selectedGroup || !price}
        >
          {loading ? <CircularProgress size={20} /> : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Диалог изменения цены
interface UpdatePriceDialogProps {
  open: boolean;
  onClose: () => void;
  service: any;
  onSuccess: () => void;
}

const UpdatePriceDialog: React.FC<UpdatePriceDialogProps> = ({ open, onClose, service, onSuccess }) => {
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setNewPrice(service.currentPrice.toString());
    }
  }, [service]);

  const handleSubmit = async () => {
    if (!newPrice) {
      setError('Введите новую цену');
      return;
    }

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Цена должна быть положительным числом');
      return;
    }

    if (priceNum === service.currentPrice) {
      setError('Новая цена должна отличаться от текущей');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await servicesAPI.updateServicePrice(service.id, priceNum);
      
      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка обновления цены');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPrice('');
    setError('');
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  if (!service) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Изменить цену услуги</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {service.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Текущая цена: {formatCurrency(service.currentPrice)}
          </Typography>
        </Box>

        <TextField
          label="Новая цена"
          type="number"
          fullWidth
          required
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          disabled={loading}
          inputProps={{ min: 0, step: 0.01 }}
          helperText="Новая цена будет применяться только к новым визитам"
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          Изменение цены не повлияет на уже созданные визиты
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !newPrice}
        >
          {loading ? <CircularProgress size={20} /> : 'Обновить цену'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServicesManager; 
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Alert,
  CircularProgress,
  Autocomplete,
  Paper,
  InputAdornment,
  TableContainer
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { useVisits } from '../contexts/VisitContext';
import { servicesAPI } from '../services/api';

const ServicesManager: React.FC = () => {
  const { services, serviceGroups, fetchServices, fetchServiceGroups, updateServicePrice } = useVisits();
  const [searchTerm, setSearchTerm] = useState('');
  const [createServiceDialogOpen, setCreateServiceDialogOpen] = useState(false);
  const [updatePriceDialogOpen, setUpdatePriceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchServices(),
        fetchServiceGroups()
      ]);
    } catch (err: any) {
      setError('Ошибка загрузки данных');
    }
  };

  const handleSearch = async () => {
    try {
      await fetchServices(searchTerm || undefined);
    } catch (err: any) {
      setError('Ошибка поиска услуг');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const handleEditPrice = (service: any) => {
    setSelectedService(service);
    setUpdatePriceDialogOpen(true);
  };

  const groupedServices = services.reduce((acc, service) => {
    const groupName = service.group.name;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(service);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Управление услугами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateServiceDialogOpen(true)}
        >
          Добавить услугу
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Поиск услуг"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Найти
        </Button>
        <Button variant="outlined" onClick={() => { setSearchTerm(''); fetchServices(); }}>
          Сбросить
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : Object.keys(groupedServices).length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Услуги не найдены
          </Typography>
        </Paper>
      ) : (
        <Box>
          {Object.entries(groupedServices).map(([groupName, groupServices]) => (
            <Box key={groupName} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #ddd', pb: 1 }}>
                {groupName} ({groupServices.length} услуг)
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название услуги</TableCell>
                      <TableCell>Подгруппа</TableCell>
                      <TableCell align="right">Цена</TableCell>
                      <TableCell align="center">Дата изменения</TableCell>
                      <TableCell align="center">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.subgroup?.name || '—'}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold">
                            {formatCurrency(service.currentPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {formatDate(service.priceUpdatedAt)}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditPrice(service)}
                          >
                            Изменить цену
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      )}

      <CreateServiceDialog
        open={createServiceDialogOpen}
        onClose={() => setCreateServiceDialogOpen(false)}
        serviceGroups={serviceGroups}
        onSuccess={() => {
          setCreateServiceDialogOpen(false);
          loadData();
        }}
      />

      <UpdatePriceDialog
        open={updatePriceDialogOpen}
        onClose={() => setUpdatePriceDialogOpen(false)}
        service={selectedService}
        onSuccess={() => {
          setUpdatePriceDialogOpen(false);
          loadData();
        }}
      />
    </Box>
  );
};

// Диалог создания услуги
interface CreateServiceDialogProps {
  open: boolean;
  onClose: () => void;
  serviceGroups: any[];
  onSuccess: () => void;
}

const CreateServiceDialog: React.FC<CreateServiceDialogProps> = ({ open, onClose, serviceGroups, onSuccess }) => {
  const [name, setName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<any>(null);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !selectedGroup || !price) {
      setError('Заполните все обязательные поля');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Цена должна быть положительным числом');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await servicesAPI.createService({
        name: name.trim(),
        groupId: selectedGroup.id,
        subgroupId: selectedSubgroup?.id,
        currentPrice: priceNum
      });

      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка создания услуги');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedGroup(null);
    setSelectedSubgroup(null);
    setPrice('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить новую услугу</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Название услуги"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <Autocomplete
            options={serviceGroups}
            getOptionLabel={(option) => option.name}
            value={selectedGroup}
            onChange={(_, value) => {
              setSelectedGroup(value);
              setSelectedSubgroup(null);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Группа услуг" required />
            )}
            disabled={loading}
          />

          {selectedGroup && selectedGroup.subgroups && (
            <Autocomplete
              options={selectedGroup.subgroups}
              getOptionLabel={(option) => option.name}
              value={selectedSubgroup}
              onChange={(_, value) => setSelectedSubgroup(value)}
              renderInput={(params) => (
                <TextField {...params} label="Подгруппа (необязательно)" />
              )}
              disabled={loading}
            />
          )}

          <TextField
            label="Цена"
            type="number"
            fullWidth
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
            inputProps={{ min: 0, step: 0.01 }}
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
          disabled={loading || !name.trim() || !selectedGroup || !price}
        >
          {loading ? <CircularProgress size={20} /> : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Диалог изменения цены
interface UpdatePriceDialogProps {
  open: boolean;
  onClose: () => void;
  service: any;
  onSuccess: () => void;
}

const UpdatePriceDialog: React.FC<UpdatePriceDialogProps> = ({ open, onClose, service, onSuccess }) => {
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setNewPrice(service.currentPrice.toString());
    }
  }, [service]);

  const handleSubmit = async () => {
    if (!newPrice) {
      setError('Введите новую цену');
      return;
    }

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Цена должна быть положительным числом');
      return;
    }

    if (priceNum === service.currentPrice) {
      setError('Новая цена должна отличаться от текущей');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await servicesAPI.updateServicePrice(service.id, priceNum);
      
      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка обновления цены');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPrice('');
    setError('');
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  if (!service) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Изменить цену услуги</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {service.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Текущая цена: {formatCurrency(service.currentPrice)}
          </Typography>
        </Box>

        <TextField
          label="Новая цена"
          type="number"
          fullWidth
          required
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          disabled={loading}
          inputProps={{ min: 0, step: 0.01 }}
          helperText="Новая цена будет применяться только к новым визитам"
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          Изменение цены не повлияет на уже созданные визиты
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !newPrice}
        >
          {loading ? <CircularProgress size={20} /> : 'Обновить цену'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServicesManager; 