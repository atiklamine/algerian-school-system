'use client';
import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Paper,
    PaperProps,
    useMediaQuery,
    useTheme,
    Box,
    Typography,
    Button
} from '@mui/material';
import Draggable from 'react-draggable';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Resizable } from 're-resizable';

interface EnhancedModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
    fullWidth?: boolean;
    onConfirm?: () => void;
    confirmText?: string;
}

function PaperComponent(props: PaperProps) {
    const nodeRef = useRef<HTMLDivElement>(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"], .draggable-cancel'}
        >
            <Paper {...props} ref={nodeRef} style={{ ...props.style, display: 'flex', flexDirection: 'column' }}>
                <Resizable
                    defaultSize={{
                        width: '100%',
                        height: 'auto',
                    }}
                    style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                    {props.children}
                </Resizable>
            </Paper>
        </Draggable>
    );
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
    open,
    onClose,
    title,
    children,
    actions,
    maxWidth = 'sm',
    fullWidth = true,
    onConfirm,
    confirmText = 'Enregistrer'
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isFullScreen, setIsFullScreen] = useState(false);

    const handleToggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperComponent={isFullScreen ? undefined : PaperComponent}
            fullScreen={isFullScreen || isMobile}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            aria-labelledby="draggable-dialog-title"
        >
            <DialogTitle style={{ cursor: isFullScreen ? 'default' : 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} id="draggable-dialog-title">
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>
                <Box>
                    <IconButton
                        className="draggable-cancel"
                        aria-label="maximize"
                        onClick={handleToggleFullScreen}
                        size="small"
                        color="inherit"
                    >
                        {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                    <IconButton
                        className="draggable-cancel"
                        aria-label="close"
                        onClick={onClose}
                        size="small"
                        color="inherit"
                        sx={{ ml: 1 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {children}
            </DialogContent>
            {(actions || onConfirm) && (
                <DialogActions>
                    {actions}
                    {onConfirm && !actions && (
                        <>
                            <Button onClick={onClose} color="inherit">
                                Annuler
                            </Button>
                            <Button onClick={onConfirm} variant="contained" color="primary">
                                {confirmText}
                            </Button>
                        </>
                    )}
                </DialogActions>
            )}
        </Dialog>
    );
};
