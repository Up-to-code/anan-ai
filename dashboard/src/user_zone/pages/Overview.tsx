export default function UserOverview() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Discover properties and track your inquiries.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Saved Properties</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Recent Inquiries</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
            </div>
        </div>
    );
}
