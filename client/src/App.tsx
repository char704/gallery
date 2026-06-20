import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams, type Location } from "react-router-dom";
import { ErrorBoundary } from "./components/Common/ErrorBoundary";
import { Footer } from "./components/Common/Footer";
import { Header } from "./components/Common/Header";
import { Sidebar } from "./components/Common/Sidebar";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { LoadingSpinner } from "./components/Common/LoadingSpinner";
import { PhotoViewerModal } from "./components/Photo/PhotoViewerModal";
import { useAuthStore } from "./store/authStore";
import AlbumDetail from "./pages/AlbumDetail";
import Explore from "./pages/Explore";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyAlbums from "./pages/MyAlbums";
import MyPhotos from "./pages/MyPhotos";
import NotFound from "./pages/NotFound";
import PhotoDetail from "./pages/PhotoDetail";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Upload from "./pages/Upload";
import UserPhotos from "./pages/UserPhotos";

function UserPhotosRedirect() {
  const { userId } = useParams();

  return <Navigate to={userId ? `/users/${userId}/photos` : "/404"} replace />;
}

export default function App() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hydrateFromToken = useAuthStore((state) => state.hydrateFromToken);

  useEffect(() => {
    if (token && !user) {
      void hydrateFromToken(token);
    }
  }, [hydrateFromToken, token, user]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-transparent text-ink">
        <Header />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
          <Sidebar />
          <main className="min-w-0 flex-1">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Routes location={backgroundLocation || location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/photos/:photoId" element={<PhotoDetail />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/users/:userId" element={<UserPhotosRedirect />} />
                  <Route path="/users/:userId/photos" element={<UserPhotos />} />
                  <Route path="/albums/:albumId" element={<AlbumDetail />} />
                  <Route
                    path="/upload"
                    element={
                      <ProtectedRoute>
                        <Upload />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/gallery"
                    element={
                      <ProtectedRoute>
                        <Gallery title="My Gallery" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/albums"
                    element={
                      <ProtectedRoute>
                        <MyAlbums />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/albums/new"
                    element={
                      <ProtectedRoute>
                        <MyAlbums showCreateForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my/photos"
                    element={
                      <ProtectedRoute>
                        <MyPhotos />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
                {backgroundLocation ? (
                  <Routes>
                    <Route path="/photos/:photoId" element={<PhotoViewerModal />} />
                  </Routes>
                ) : null}
              </>
            )}
          </main>
        </div>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
