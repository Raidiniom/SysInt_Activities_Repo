import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import '../styles/PostTable.css'; 

export function PostsTable({ posts }) {
    return (
        <div className="posts-container">
            <Card className="posts-card">
                <h2 className="table-title">Frens_Posting</h2>

                {posts.length === 0 ? (
                    <div className="empty-state">
                        <Message severity="info" text="No posts available yet." />
                    </div>
                ) : (
                    <DataTable 
                        value={posts} 
                        className="posts-table"
                        stripedRows 
                        paginator 
                        rows={20}
                        emptyMessage="No posts found."
                    >
                        <Column field="id" header="ID" style={{ width: '10%' }} />
                        <Column field="title" header="Title" style={{ width: '30%' }} />
                        <Column field="content" header="Content" style={{ width: '60%' }} />
                    </DataTable>
                )}
            </Card>
        </div>
    );
}
