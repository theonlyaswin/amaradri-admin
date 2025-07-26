'use client';

import { useState, useEffect } from 'react';
import { Plus, SaveIcon, ExternalLink, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { saveClientGallery, fetchClientGalleries, deleteClientGallery, type ClientGallery } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

function StatusIndicator({ status }: { status: 'live' | 'hidden' }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm text-gray-500 capitalize">{status}</span>
        </div>
    );
}

function GalleryCard({ 
    gallery, 
    onDelete 
}: { 
    gallery: ClientGallery;
    onDelete: () => void;
}) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteClientGallery(gallery.name);
            onDelete();
            toast({
                title: "Success",
                description: "Gallery has been deleted successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete gallery",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl font-bold">{gallery.name}</CardTitle>
                            <CardDescription className="mt-2">{gallery.title}</CardDescription>
                        </div>
                        <StatusIndicator status={gallery.status} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>URL: {`https://amaradriweddings.com/client-gallery/${gallery.url}`}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-sm text-gray-500">
                        Created: {new Date(gallery.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(gallery.driveLink, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Drive
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="z-[1001]">
                    <DialogHeader>
                        <DialogTitle>Delete Gallery</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the gallery for {gallery.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Yes, Delete Gallery"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function ClientGalleryLayout() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [galleries, setGalleries] = useState<ClientGallery[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        driveLink: '',
        title: ''
    });
    
    const router = useRouter();
    const { toast } = useToast();

    const refreshGalleries = async () => {
        try {
            const fetchedGalleries = await fetchClientGalleries();
            setGalleries(fetchedGalleries);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch galleries",
                variant: "destructive",
            });
        }
    };

    // Auth check and fetch galleries
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push('/');
            } else {
                await refreshGalleries();
            }
        });

        return () => unsubscribe();
    }, [router, toast]);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setFormError(null);
            
            if (!formData.name || !formData.driveLink || !formData.title) {
                throw new Error('Please fill in all fields');
            }

            await saveClientGallery(formData);
            await refreshGalleries();
            
            setIsConfirmDialogOpen(false);
            setIsDialogOpen(false);
            
            toast({
                title: "Success!",
                description: "Client gallery has been created successfully.",
            });

            setFormData({
                name: '',
                driveLink: '',
                title: ''
            });
        } catch (error) {
            // Check for specific error message
            const errorMessage = error instanceof Error ? error.message : "Failed to create client gallery";
            
            if (errorMessage.includes('gallery with this name already exists')) {
                setFormError('Invalid name or name already exists');
                setIsConfirmDialogOpen(false); // Close confirm dialog
            } else {
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white p-8">
            <div className="grid gap-6 w-full max-w-6xl">
                {/* Add New Client Card */}
                <div
                    className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition group bg-gray-50 relative"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Plus className="w-12 h-12 text-gray-400 group-hover:text-gray-600 transition" />
                    <span className="mt-2 text-xs text-gray-400 group-hover:text-gray-600">Add New Client</span>
                </div>

                {/* Gallery Grid */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {galleries.map((gallery) => (
                        <GalleryCard 
                            key={gallery.url} 
                            gallery={gallery} 
                            onDelete={refreshGalleries}
                        />
                    ))}
                </div>
            </div>

            {/* Add Gallery Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="z-[1000]">
                    <DialogHeader>
                        <DialogTitle>Add New Client Gallery</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the new client gallery.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormError(null);
                                    setFormData(prev => ({ ...prev, name: e.target.value }));
                                }}
                                placeholder="Enter client name"
                                className={formError ? "border-red-500" : ""}
                            />
                            {formError && (
                                <p className="text-sm text-red-500 mt-1">{formError}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="driveLink">Drive Link</Label>
                            <Input
                                id="driveLink"
                                value={formData.driveLink}
                                onChange={(e) => setFormData(prev => ({ ...prev, driveLink: e.target.value }))}
                                placeholder="Enter Google Drive link"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter gallery title"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsDialogOpen(false);
                            setFormError(null);
                        }} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-black hover:bg-gray-700 text-white" 
                            onClick={() => setIsConfirmDialogOpen(true)}
                            disabled={isLoading || !!formError}
                        >
                            <SaveIcon className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="z-[1001]">
                    <DialogHeader>
                        <DialogTitle>Confirm Save</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to create this client gallery? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-black hover:bg-gray-700 text-white"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Yes, Create Gallery"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}