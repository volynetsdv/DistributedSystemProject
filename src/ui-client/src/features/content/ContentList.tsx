import { useState, useRef } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, Tooltip, Chip, Snackbar, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageIcon from '@mui/icons-material/Image';
import { AppButton } from '../../shared/componenst/AppButton/AppButton';
import {
    useGetContentQuery,
    useCreateContentMutation,
    useUpdateContentMutation,
    useDeleteContentMutation,
    useUploadImageMutation,
} from './contentApi';
import type { ContentItem, ContentItemCreate } from './models';
import './ContentList.scss';

const EMPTY_FORM: ContentItemCreate = { title: '', body: '', externalId: '' };

export const ContentList = () => {
    const { data = [], isLoading, isFetching, refetch } = useGetContentQuery();
    const [create] = useCreateContentMutation();
    const [update] = useUpdateContentMutation();
    const [remove] = useDeleteContentMutation();
    const [uploadImage] = useUploadImageMutation();

    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
    const [form, setForm] = useState<ContentItemCreate>(EMPTY_FORM);
    // Зберігаємо оригінальний item для збереження imageUrl/createdAt під час PUT
    const [editItem, setEditItem] = useState<ContentItem | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [uploadId, setUploadId] = useState<number | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
        open: false, msg: '', severity: 'success',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showSnack = (msg: string, severity: 'success' | 'error' = 'success') =>
        setSnack({ open: true, msg, severity });

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setEditItem(null);
        setDialogMode('create');
    };

    const openEdit = (item: ContentItem) => {
        setForm({ title: item.title, body: item.body, externalId: item.externalId ?? '' });
        setEditItem(item);
        setDialogMode('edit');
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await create(form).unwrap();
                showSnack('Запис створено');
            } else if (dialogMode === 'edit' && editItem !== null) {
                // Зберігаємо imageUrl і createdAt щоб PUT не занулив їх
                await update({ ...editItem, ...form }).unwrap();
                showSnack('Запис оновлено');
            }
            setDialogMode(null);
        } catch {
            showSnack('Помилка збереження', 'error');
        }
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        try {
            await remove(deleteId).unwrap();
            showSnack('Запис видалено');
        } catch {
            showSnack('Помилка видалення', 'error');
        }
        setDeleteId(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || uploadId === null) return;
        try {
            await uploadImage({ id: uploadId, file }).unwrap();
            showSnack('Файл завантажено до Azure Blob Storage');
        } catch {
            showSnack('Помилка завантаження файлу', 'error');
        }
        setUploadId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const triggerUpload = (id: number) => {
        setUploadId(id);
        fileInputRef.current?.click();
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="content-panel">
            <div className="content-panel__header">
                <h3>Content Items (CRUD)</h3>
                <div className="content-panel__actions">
                    <AppButton
                        variant="outlined"
                        onClick={() => refetch()}
                        loading={isFetching}
                        startIcon={<RefreshIcon />}
                    >
                        Refresh
                    </AppButton>
                    <AppButton
                        variant="contained"
                        color="primary"
                        onClick={openCreate}
                        startIcon={<AddIcon />}
                    >
                        New Item
                    </AppButton>
                </div>
            </div>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Body</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ color: '#888', py: 3 }}>
                                No items yet. Click "New Item" to create one.
                            </TableCell>
                        </TableRow>
                    )}
                    {data.map((item) => (
                        <TableRow key={item.id} hover>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell className="body-cell">{item.body}</TableCell>
                            <TableCell>
                                {item.imageUrl ? (
                                    <Tooltip title={item.imageUrl}>
                                        <a href={item.imageUrl} target="_blank" rel="noreferrer">
                                            <Chip
                                                icon={<ImageIcon />}
                                                label="View"
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </a>
                                    </Tooltip>
                                ) : (
                                    <span className="no-image">—</span>
                                )}
                            </TableCell>
                            <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                            <TableCell align="right">
                                <Tooltip title="Upload image to Azure Blob Storage">
                                    <IconButton size="small" color="info" onClick={() => triggerUpload(item.id)}>
                                        <CloudUploadIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                    <IconButton size="small" color="primary" onClick={() => openEdit(item)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton size="small" color="error" onClick={() => setDeleteId(item.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Create / Edit Dialog */}
            <Dialog open={dialogMode !== null} onClose={() => setDialogMode(null)} fullWidth maxWidth="sm">
                <DialogTitle>{dialogMode === 'create' ? 'New Content Item' : 'Edit Content Item'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                        label="Title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Body"
                        value={form.body}
                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                        fullWidth
                        multiline
                        rows={4}
                    />
                    <TextField
                        label="External ID (optional)"
                        value={form.externalId}
                        onChange={(e) => setForm({ ...form, externalId: e.target.value })}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <AppButton onClick={() => setDialogMode(null)}>Cancel</AppButton>
                    <AppButton
                        variant="contained"
                        onClick={handleSave}
                        disabled={!form.title.trim()}
                    >
                        Save
                    </AppButton>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
                <DialogTitle>Delete item #{deleteId}?</DialogTitle>
                <DialogContent>This action cannot be undone.</DialogContent>
                <DialogActions>
                    <AppButton onClick={() => setDeleteId(null)}>Cancel</AppButton>
                    <AppButton variant="contained" color="error" onClick={handleDelete}>
                        Delete
                    </AppButton>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} variant="filled">
                    {snack.msg}
                </Alert>
            </Snackbar>
        </div>
    );
};
