import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, LogOut, Copy, Upload, Image as ImageIcon } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""

function Dashboard() {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFeedback, setUploadFeedback] = useState({ type: "", message: "" })
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchImages()
  }, [navigate])

  const fetchImages = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/images/getAll`, {
        withCredentials: true,
      })
      console.log("response:", response.data)
      console.log("total images:", response.data.images.length)
      setImages(response.data.images)
    } catch (error) {
      console.error("Failed to fetch images", error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true })
    } catch (error) {
      console.error("Logout failed", error)
    } finally {
      Cookies.remove("myDigitalToken") // Keep as fallback for non-httpOnly if any
      navigate("/login")
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    const allowedFileTypes = ["image/jpeg", "image/png", "application/zip", "application/x-zip-compressed"]
    if (!allowedFileTypes.includes(selectedFile.type)) {
      setUploadFeedback({ type: "error", message: "This is not an image file. Please choose an image file." })
      setFile(null)
      setPreviewUrl(null)
      return
    }
    setFile(selectedFile)
    setPreviewUrl(selectedFile.type === "application/zip" || selectedFile.type === "application/x-zip-compressed" ? null : URL.createObjectURL(selectedFile))
    setUploadFeedback({ type: "", message: "" })
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setUploadFeedback({ type: "", message: "" })

    const formData = new FormData()
    formData.append("image", file)

    try {
      await axios.post(`${API_BASE_URL}/api/images/upload`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setUploadFeedback({ type: "success", message: "Image uploaded successfully!" })
      setFile(null)
      setPreviewUrl(null)
      e.target.reset()
      fetchImages()
    } catch (error) {
      setUploadFeedback({
        type: "error",
        message: error.response?.data?.message ?? "Upload failed. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    alert("Link copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-border bg-white backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <ImageIcon className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">MyDigital</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Upload New Image</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="image">
                  Choose your image file
                </label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*,application/zip,application/x-zip-compressed"
                  onChange={handleFileChange}
                  className="cursor-pointer file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                  required
                />
              </div>
              <Button type="submit" disabled={isUploading || !file} className="min-w-[120px] shadow-sm">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </form>

            {previewUrl && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-slate-700">Image Preview</p>
                <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-border bg-slate-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
                    onClick={() => {
                      setFile(null)
                      setPreviewUrl(null)
                      document.getElementById("image").value = ""
                    }}
                  >
                    <span className="sr-only">Remove image</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {uploadFeedback.message && (
              <p className={`mt-3 text-sm ${uploadFeedback.type === "success" ? "text-green-600" : "text-destructive"}`}>
                {uploadFeedback.message}
              </p>
            )}
          </CardContent>
        </Card>

        <section>
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Your Gallery</h2>
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Fetching your images...</p>
            </div>
          ) : images.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {images.map((img) => (
                <Card key={img.id} className="group overflow-hidden transition-all hover:shadow-md py-0">
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden bg-slate-100">
                    <img
                      src={img.thumb64}
                      alt={img.filename}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="w-32 p-4 pt-0">
                    <p className="mb-3 truncate text-sm font-medium text-slate-700" title={img.filename}>
                      {img.image_name}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-medium"
                      onClick={() => copyToClipboard(img.original_url, img.id)}
                    >
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Copy Link
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">No images found</h3>
                <p className="text-sm text-muted-foreground">Upload your first image to get started.</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard
