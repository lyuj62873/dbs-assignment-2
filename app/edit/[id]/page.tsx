import Editor from '@/components/Editor'

interface Props {
  params: { id: string }
}

export default function EditPage({ params }: Props) {
  return <Editor id={params.id} />
}
