import ScriptWriter from '@/views/Dashboard/ScriptWriter'

interface PageProps {
  params: {
    id: string
  }
}

const Page = ({ params }: PageProps) => {
  return <ScriptWriter projectId={params.id} />
}

export default Page
