import ProjectFormScreen from "../../shared/forms/ProjectFormScreen";
import { deleteProjectAction, revokeProjectViewerAction, saveProjectAction } from "./actions";
import { loadEditProjectPageState } from "./loaders";

type EditProjectRouteProps = {
  params: Promise<{ projectId: string }>;
};

export default async function EditProjectRoute({ params }: EditProjectRouteProps) {
  const { actionArgs, description, initialData, title } = await loadEditProjectPageState((await params).projectId);

  return (
    <ProjectFormScreen
      projectId={actionArgs.projectId}
      initialData={initialData}
      title={title}
      description={description}
      submitLabel="حفظ التعديلات"
      onSave={saveProjectAction.bind(null, actionArgs)}
      onDelete={deleteProjectAction.bind(null, actionArgs)}
      onRevokeViewer={revokeProjectViewerAction.bind(null, actionArgs)}
    />
  );
}
