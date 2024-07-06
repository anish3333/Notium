import OrganizationProvider from '@/context/OrganisationContext'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  )
}

export default layout