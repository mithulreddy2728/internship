"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = "https://your-project-url.supabase.co"
const supabaseKey = "your-anon-key"
const supabase = createClient(supabaseUrl, supabaseKey)

// Type definitions
interface User {
  id: number
  name: string
  email: string
  created_at: string
}

interface Camera {
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
  camera?: Camera
}

interface Vehicle {
  id: number
  camera_id: number
  marker_id: number
  number: string
  numberplate_image: string
  vehicle_image: string
  person_image: string
  time_stamp: string
  status: number
  created_at: string
  camera?: Camera
  marker?: GeoMarker
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [cameras, setCameras] = useState<Camera[]>([])
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
                          <Badge variant="outline" className="cursor-pointer">
                            Vehicle
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            Numberplate
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            Person
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
          <li>Run the SQL script to create the tables and insert demo data</li>
        </ol>
      </div>
    </main>
  )
}
