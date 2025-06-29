import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ITRequest } from '@/types';
import { getRequests } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import RequestCard from '@/components/requests/RequestCard';

const MyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ITRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const fetchedRequests = await getRequests(user.id);
        setRequests(fetchedRequests);
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [user]);
  
  const activeRequests = requests.filter(
    r => r.status !== 'resolved' && r.status !== 'closed' && r.status !== 'resolvida' && r.status !== 'fechada'
  );
  
  const resolvedRequests = requests.filter(
    r => r.status === 'resolved' || r.status === 'closed' || r.status === 'resolvida' || r.status === 'fechada'
  );
  
  const filterRequests = (requests: ITRequest[]) => {
    if (!searchQuery) return requests;
    
    return requests.filter(
      r => 
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  const filteredActive = filterRequests(activeRequests);
  const filteredResolved = filterRequests(resolvedRequests);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Minhas Solicitações</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar solicitações..."
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link to="/request/new">
              <FilePlus className="h-4 w-4 mr-2" />
              Nova Solicitação
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Ativas ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolvidas ({resolvedRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredActive.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="font-medium text-lg mb-2">Nenhuma solicitação ativa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Nenhuma solicitação corresponde à sua busca" 
                  : "Você não possui solicitações ativas"}
              </p>
              <Button asChild>
                <Link to="/request/new">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Criar Nova Solicitação
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActive.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="resolved" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredResolved.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="font-medium text-lg mb-2">Nenhuma solicitação resolvida encontrada</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Nenhuma solicitação resolvida corresponde à sua busca" 
                  : "Você ainda não possui solicitações resolvidas"}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredResolved.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyRequestsPage;
