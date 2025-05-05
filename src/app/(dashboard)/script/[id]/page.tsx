import ScriptWriter from '@/views/ScriptWriter/ScriptWriter'

interface PageProps {
  params: {
    id: string
  }
}

const Page = ({ params }: PageProps) => {
  return <ScriptWriter projectId={params.id} />
}

export default Page
