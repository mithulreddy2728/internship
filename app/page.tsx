"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, AlertCircle, Camera, Car, User } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = "https://uvhgcllcxhspxqkiqgyd.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2aGdjbGxjeGhzcHhxa2lxZ3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NzEwODYsImV4cCI6MjA2MjQ0NzA4Nn0.XcCqwBBue6ToCfzqIGme42PIiUde-qxebH3FKkS_di4"
const supabase = createClient(supabaseUrl, supabaseKey)

// Type definitions
interface UserType {
  id: number
  name: string
  email: string
  created_at: string
}

interface CameraType {
  id: number
  type: number
  source: string
  status: string
  created_at: string
}

interface GeoMarker {
  id: number
  camera_id: number
  x1: number
  x2: number
  y1: number
  y2: number
  created_at: string
  camera?: CameraType
}

interface Vehicle {
  id: number
  camera_id: number
  marker_id: number
  number: string
  numberplate_image: string | null
  vehicle_image: string | null
  person_image: string | null
  time_stamp: string
  status: number
  created_at: string
  camera?: CameraType
  marker?: GeoMarker
}

// Component to display base64 images with error handling
const Base64Image = ({
  base64String,
  alt,
  width = 200,
  height = 150,
}: {
  base64String: string | null
  alt: string
  width?: number
  height?: number
}) => {
  const [error, setError] = useState(false)

  if (!base64String) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md"
        style={{ width, height }}
      >
        <AlertCircle className="h-6 w-6 text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">No image</span>
      </div>
    )
  }

  // Check if the base64 string is valid
  const isValidBase64 = () => {
    try {
      // Try to validate the base64 string format
      return /^data:image\/[a-z]+;base64,/.test(base64String) || /^[A-Za-z0-9+/=]+$/.test(base64String)
    } catch (e) {
      return false
    }
  }

  if (!isValidBase64() || error) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md"
        style={{ width, height }}
      >
        <AlertCircle className="h-6 w-6 text-red-400" />
        <span className="ml-2 text-sm text-red-500">Invalid image</span>
      </div>
    )
  }

  // Ensure the base64 string has the proper prefix
  const imgSrc = base64String.startsWith("data:image") ? base64String : `data:image/jpeg;base64,${base64String}`

  return (
    <img
      src={imgSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className="rounded-md object-cover"
      onError={() => setError(true)}
    />
  )
}

// Image dialog component
const ImageDialog = ({
  title,
  base64String,
  icon: Icon,
}: {
  title: string
  base64String: string | null
  icon: React.ElementType
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
          <Icon className="h-4 w-4 mr-1" />
          {title}
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <Base64Image base64String={base64String} alt={title} width={400} height={300} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Home() {
  const [users, setUsers] = useState<UserType[]>([])
  const [cameras, setCameras] = useState<CameraType[]>([])
  const [geoMarkers, setGeoMarkers] = useState<GeoMarker[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch users
        const { data: usersData, error: usersError } = await supabase.from("users").select("*")

        if (usersError) throw usersError
        setUsers(usersData || [])

        // Fetch cameras
        const { data: camerasData, error: camerasError } = await supabase.from("cameras").select("*")

        if (camerasError) throw camerasError
        setCameras(camerasData || [])

        // Fetch geo_markers with camera data
        const { data: markersData, error: markersError } = await supabase
          .from("geo_markers")
          .select("*, camera:cameras(*)")

        if (markersError) throw markersError
        setGeoMarkers(markersData || [])

        // Fetch vehicles with camera and marker data
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("*, camera:cameras(*), marker:geo_markers(*)")

        if (vehiclesError) throw vehiclesError
        setVehicles(vehiclesData || [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to fetch data. Please check your connection.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-[600px]">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Note: This is a demo application. Make sure to update the Supabase URL and key in the code.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Vehicle Monitoring System</h1>

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="cameras">Cameras</TabsTrigger>
          <TabsTrigger value="geomarkers">Geo Markers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicles Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>List of detected vehicles</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Vehicle Number</TableHead>
                      <TableHead>Camera</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead>Preview</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.id}</TableCell>
                        <TableCell>{vehicle.number}</TableCell>
                        <TableCell>
                          {vehicle.camera ? (
                            <>
                              Camera #{vehicle.camera_id}
                              <Badge
                                className="ml-2"
                                variant={vehicle.camera.status === "active" ? "default" : "secondary"}
                              >
                                {vehicle.camera.status}
                              </Badge>
                            </>
                          ) : (
                            `Camera #${vehicle.camera_id}`
                          )}
                        </TableCell>
                        <TableCell>{new Date(vehicle.time_stamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={vehicle.status === 1 ? "default" : "secondary"}>
                            {vehicle.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <ImageDialog title="Vehicle" base64String={vehicle.vehicle_image} icon={Car} />
                            <ImageDialog title="Numberplate" base64String={vehicle.numberplate_image} icon={Camera} />
                            <ImageDialog title="Person" base64String={vehicle.person_image} icon={User} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Base64Image
                              base64String={vehicle.vehicle_image}
                              alt={`Vehicle ${vehicle.id}`}
                              width={60}
                              height={45}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cameras">
          <Card>
            <CardHeader>
              <CardTitle>Cameras Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of surveillance cameras</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cameras.map((camera) => (
                    <TableRow key={camera.id}>
                      <TableCell className="font-medium">{camera.id}</TableCell>
                      <TableCell>{camera.type === 1 ? "URL Stream" : "MP4 File"}</TableCell>
                      <TableCell>{camera.source}</TableCell>
                      <TableCell>
                        <Badge variant={camera.status === "active" ? "default" : "secondary"}>{camera.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(camera.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geomarkers">
          <Card>
            <CardHeader>
              <CardTitle>Geo Markers Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of geo markers for detection zones</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Camera</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {geoMarkers.map((marker) => (
                    <TableRow key={marker.id}>
                      <TableCell className="font-medium">{marker.id}</TableCell>
                      <TableCell>
                        {marker.camera ? (
                          <>
                            Camera #{marker.camera_id}
                            <Badge
                              className="ml-2"
                              variant={marker.camera.status === "active" ? "default" : "secondary"}
                            >
                              {marker.camera.status}
                            </Badge>
                          </>
                        ) : (
                          `Camera #${marker.camera_id}`
                        )}
                      </TableCell>
                      <TableCell>
                        X: {marker.x1}-{marker.x2}, Y: {marker.y1}-{marker.y2}
                      </TableCell>
                      <TableCell>{new Date(marker.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of system users</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 rounded-md bg-yellow-50 p-4 text-yellow-800">
        <h3 className="font-bold">Demo Note</h3>
        <p>This is a demo application. To make it work with your Supabase instance:</p>
        <ol className="ml-6 mt-2 list-decimal">
          <li>Update the supabaseUrl and supabaseKey variables in the code</li>
          <li>Make sure your database has the required tables and data structure</li>
        </ol>
      </div>
    </main>
  )
}
