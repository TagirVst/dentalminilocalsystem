import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Collapse,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { Visit } from '../types';
import PaymentDialog from './PaymentDialog';

interface VisitCardProps {
  visit: Visit;
  userRole: 'doctor' | 'admin' | 'manager';
  onPaymentUpdate?: (visitId: number) => void;
}

const VisitCard: React.FC<VisitCardProps> = ({ visit, userRole, onPaymentUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'unpaid': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачен';
      case 'partial': return 'Частично';
      case 'unpaid': return 'Не оплачен';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePaymentUpdate = () => {
    setPaymentDialogOpen(false);
    if (onPaymentUpdate) {
      onPaymentUpdate(visit.id);
    }
  };

  const canMakePayment = userRole === 'admin' && !visit.paymentDate;

  const truncateComment = (comment: string, maxLength: number = 50) => {
    if (!comment) return '';
    return comment.length > maxLength ? comment.slice(0, maxLength) + '...' : comment;
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="div">
                {visit.patientName}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {formatDateTime(visit.visitDate)} • {visit.doctor.name}
              </Typography>
              {visit.comment && !expanded && (
                <Typography variant="body2" color="textSecondary">
                  {truncateComment(visit.comment)}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" color="primary">
                {formatCurrency(visit.totalAmount)}
              </Typography>
              <Chip
                label={getPaymentStatusText(visit.paymentStatus)}
                color={getPaymentStatusColor(visit.paymentStatus) as any}
                size="small"
              />
              {canMakePayment && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PaymentIcon />}
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  Оплата
                </Button>
              )}
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              {visit.comment && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Комментарий:
                  </Typography>
                  <Typography variant="body2">
                    {visit.comment}
                  </Typography>
                </Box>
              )}

              <Typography variant="subtitle2" gutterBottom>
                Услуги:
              </Typography>
              <Table size="small">
                <TableBody>
                  {visit.visitServices.map((vs) => (
                    <TableRow key={vs.id}>
                      <TableCell>{vs.service.name}</TableCell>
                      <TableCell align="center">{vs.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(vs.priceAtDate)}</TableCell>
                      <TableCell align="right">{formatCurrency(vs.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="subtitle2">Итого:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {formatCurrency(visit.totalAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {visit.paymentDate && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Оплата:
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      {visit.cashPayment > 0 && (
                        <TableRow>
                          <TableCell>Наличные</TableCell>
                          <TableCell align="right">{formatCurrency(visit.cashPayment)}</TableCell>
                        </TableRow>
                      )}
                      {visit.cardPayment > 0 && (
                        <TableRow>
                          <TableCell>Картой</TableCell>
                          <TableCell align="right">{formatCurrency(visit.cardPayment)}</TableCell>
                        </TableRow>
                      )}
                      {visit.transferPayment > 0 && (
                        <TableRow>
                          <TableCell>Переводом</TableCell>
                          <TableCell align="right">{formatCurrency(visit.transferPayment)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Оплачено {formatDateTime(visit.paymentDate)}
                    {visit.administrator && ` • ${visit.administrator.name}`}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {canMakePayment && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          visit={visit}
          onSuccess={handlePaymentUpdate}
        />
      )}
    </>
  );
};

export default VisitCard; 
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Collapse,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { Visit } from '../types';
import PaymentDialog from './PaymentDialog';

interface VisitCardProps {
  visit: Visit;
  userRole: 'doctor' | 'admin' | 'manager';
  onPaymentUpdate?: (visitId: number) => void;
}

const VisitCard: React.FC<VisitCardProps> = ({ visit, userRole, onPaymentUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'unpaid': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачен';
      case 'partial': return 'Частично';
      case 'unpaid': return 'Не оплачен';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePaymentUpdate = () => {
    setPaymentDialogOpen(false);
    if (onPaymentUpdate) {
      onPaymentUpdate(visit.id);
    }
  };

  const canMakePayment = userRole === 'admin' && !visit.paymentDate;

  const truncateComment = (comment: string, maxLength: number = 50) => {
    if (!comment) return '';
    return comment.length > maxLength ? comment.slice(0, maxLength) + '...' : comment;
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="div">
                {visit.patientName}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {formatDateTime(visit.visitDate)} • {visit.doctor.name}
              </Typography>
              {visit.comment && !expanded && (
                <Typography variant="body2" color="textSecondary">
                  {truncateComment(visit.comment)}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" color="primary">
                {formatCurrency(visit.totalAmount)}
              </Typography>
              <Chip
                label={getPaymentStatusText(visit.paymentStatus)}
                color={getPaymentStatusColor(visit.paymentStatus) as any}
                size="small"
              />
              {canMakePayment && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PaymentIcon />}
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  Оплата
                </Button>
              )}
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              {visit.comment && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Комментарий:
                  </Typography>
                  <Typography variant="body2">
                    {visit.comment}
                  </Typography>
                </Box>
              )}

              <Typography variant="subtitle2" gutterBottom>
                Услуги:
              </Typography>
              <Table size="small">
                <TableBody>
                  {visit.visitServices.map((vs) => (
                    <TableRow key={vs.id}>
                      <TableCell>{vs.service.name}</TableCell>
                      <TableCell align="center">{vs.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(vs.priceAtDate)}</TableCell>
                      <TableCell align="right">{formatCurrency(vs.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="subtitle2">Итого:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {formatCurrency(visit.totalAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {visit.paymentDate && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Оплата:
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      {visit.cashPayment > 0 && (
                        <TableRow>
                          <TableCell>Наличные</TableCell>
                          <TableCell align="right">{formatCurrency(visit.cashPayment)}</TableCell>
                        </TableRow>
                      )}
                      {visit.cardPayment > 0 && (
                        <TableRow>
                          <TableCell>Картой</TableCell>
                          <TableCell align="right">{formatCurrency(visit.cardPayment)}</TableCell>
                        </TableRow>
                      )}
                      {visit.transferPayment > 0 && (
                        <TableRow>
                          <TableCell>Переводом</TableCell>
                          <TableCell align="right">{formatCurrency(visit.transferPayment)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Оплачено {formatDateTime(visit.paymentDate)}
                    {visit.administrator && ` • ${visit.administrator.name}`}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {canMakePayment && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          visit={visit}
          onSuccess={handlePaymentUpdate}
        />
      )}
    </>
  );
};

export default VisitCard; 