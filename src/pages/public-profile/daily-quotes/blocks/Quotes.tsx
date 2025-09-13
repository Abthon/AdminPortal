import { useEffect, useMemo, useState } from "react";
import { KeenIcon } from "@/components";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axiosInstance from "@/auth/_helpers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface IQuote {
  id: string;
  updatedAt: string;
  createdAt: string;
  content: string;
  author: string;
}

interface IQuoteForm {
  content: string;
  author: string;
}

const Quotes = ({
  isAddOpen,
  _handleAddOpen,
  handleQuoteCount,
  searchInput,
}: {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleQuoteCount: (num: any) => void;
  searchInput?: string;
}) => {
  const [quotes, setQuotes] = useState<IQuote[]>([]);
  const [editingQuote, setEditingQuote] = useState<IQuote | null>(null);
  const [quoteForm, setQuoteForm] = useState<IQuoteForm>({
    content: "",
    author: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const itemsPerPage = 6;

  // Fetch quotes
  const { data: quotesData, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ["quotes", searchInput, currentPage],
    queryFn: async () => {
      const searchParam = searchInput ? `search=${searchInput}&` : "";
      const url = `/api/v1/quote?${searchParam}page=${currentPage}&take=${itemsPerPage}`;
      const { data } = await axiosInstance.get(url);
      return data;
    },
    onSuccess: (data) => {
      setQuotes(data?.data || []);
      setTotalQuotes(data?.pagination?.totalItems || 0);
      setTotalPages(Math.ceil((data?.pagination?.totalItems || 0) / itemsPerPage));
      handleQuoteCount(data?.pagination?.totalItems || 0);
    },
  });

  const queryClient = useQueryClient();

  // Create quote mutation
  const { isLoading: isCreating, mutate: createQuote } = useMutation({
    mutationFn: async (quoteData: IQuoteForm) => {
      const { data } = await axiosInstance.post('/api/v1/quote', quoteData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["quotes"]);
      setQuoteForm({ content: "", author: "" });
      _handleAddOpen(false);
      toast("Quote created successfully!");
    },
    onError: (error: any) => {
      toast(error?.message || "Error creating quote");
    },
  });

  // Update quote mutation
  const { isLoading: isUpdating, mutate: updateQuote } = useMutation({
    mutationFn: async ({ id, ...quoteData }: IQuoteForm & { id: string }) => {
      const { data } = await axiosInstance.patch(`/api/v1/quote/${id}`, quoteData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["quotes"]);
      setQuoteForm({ content: "", author: "" });
      setEditingQuote(null);
      _handleAddOpen(false);
      toast("Quote updated successfully!");
    },
    onError: (error: any) => {
      toast(error?.message || "Error updating quote");
    },
  });

  // Delete quote mutation
  const { isLoading: isDeleting, mutate: deleteQuote } = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/api/v1/quote/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["quotes"]);
      toast("Quote deleted successfully!");
    },
    onError: (error: any) => {
      toast(error?.message || "Error deleting quote");
    },
  });

  const handleSubmit = () => {
    if (!quoteForm.content.trim() || !quoteForm.author.trim()) {
      toast("Please fill in both content and author fields");
      return;
    }

    if (editingQuote) {
      updateQuote({ ...quoteForm, id: editingQuote.id });
    } else {
      createQuote(quoteForm);
    }
  };

  const handleEdit = (quote: IQuote) => {
    console.log("Edit button clicked for quote:", quote);
    setEditingQuote(quote);
    setQuoteForm({
      content: quote.content,
      author: quote.author,
    });
    _handleAddOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log("Delete button clicked for ID:", id);
    setQuoteToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (quoteToDelete) {
      console.log("Confirmed deletion, calling deleteQuote");
      deleteQuote(quoteToDelete);
      setDeleteConfirmOpen(false);
      setQuoteToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setQuoteToDelete(null);
  };

  const handleModalClose = () => {
    _handleAddOpen(false);
    setEditingQuote(null);
    setQuoteForm({ content: "", author: "" });
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoadingQuotes) {
    return (
      <div className="flex items-center justify-center p-8">
        <KeenIcon icon="loading" className="animate-spin text-gray-400 text-2xl" />
        <span className="ml-3 text-gray-600">Loading quotes...</span>
      </div>
    );
  }

  return (
    <>
      {/* Quote Creation/Edit Modal */}
      <Dialog open={isAddOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuote ? "Edit Quote" : "Create New Quote"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">
                Quote Content
              </label>
              <Textarea
                placeholder="Enter the quote content..."
                value={quoteForm.content}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">
                Author
              </label>
              <Input
                placeholder="Enter the author name..."
                value={quoteForm.author}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, author: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleModalClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating || !quoteForm.content.trim() || !quoteForm.author.trim()}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {(isCreating || isUpdating) ? (
                  <>
                    <KeenIcon icon="loading" className="animate-spin mr-2" />
                    {editingQuote ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <KeenIcon icon={editingQuote ? "edit" : "plus"} className="mr-2" />
                    {editingQuote ? "Update Quote" : "Create Quote"}
                  </>
                )}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeenIcon icon="warning-2" className="text-red-500" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this quote? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <KeenIcon icon="loading" className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <KeenIcon icon="trash" className="mr-2" />
                    Delete Quote
                  </>
                )}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Quotes Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daily Quotes Management</h3>
        </div>
        <div className="card-body">
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <KeenIcon icon="file-text" className="text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No quotes found</p>
              <p className="text-gray-400 text-sm">
                {searchInput ? "Try adjusting your search terms" : "Start by creating your first quote"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quotes.map((quote: IQuote) => (
                <div
                  key={quote.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <blockquote className="text-gray-800 text-base leading-relaxed mb-3 italic">
                        "{quote.content}"
                      </blockquote>
                      <p className="text-sm font-medium text-gray-600">
                        — {quote.author}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(quote)}
                        className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:border-blue-300"
                      >
                        <KeenIcon icon="notepad-edit" className="text-sm" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(quote.id)}
                        disabled={isDeleting}
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <KeenIcon icon="trash" className="text-sm" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3"
                  >
                    <KeenIcon icon="left" className="text-sm" />
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`px-3 ${
                          currentPage === page 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : ""
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3"
                  >
                    <KeenIcon icon="right" className="text-sm" />
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center text-sm text-gray-500 mt-4">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalQuotes)} of {totalQuotes} quotes
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export { Quotes };
