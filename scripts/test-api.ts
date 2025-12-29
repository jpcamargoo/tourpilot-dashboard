import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

async function testAPI(name: string, fn: () => Promise<any>) {
  try {
    const result = await fn();
    results.push({
      name,
      status: 'success',
      message: 'OK',
      data: result,
    });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    results.push({
      name,
      status: 'error',
      message: error.message || 'Erro desconhecido',
    });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Iniciando testes de APIs...\n');

  // 1. Testar página inicial
  await testAPI('Página inicial (GET /)', async () => {
    const response = await axios.get(`${BASE_URL}/`);
    return response.status === 200 ? 'Carregou' : 'Erro';
  });

  // 2. Testar página de login
  await testAPI('Página de login (GET /login)', async () => {
    const response = await axios.get(`${BASE_URL}/login`);
    return response.status === 200 ? 'Carregou' : 'Erro';
  });

  // 3. Testar API de tours (sem autenticação - deve dar 401)
  await testAPI('API Tours sem auth (GET /api/tours)', async () => {
    try {
      await axios.get(`${BASE_URL}/api/tours`);
      throw new Error('Deveria retornar 401');
    } catch (error: any) {
      if (error.response?.status === 401) {
        return 'Autenticação funcionando corretamente';
      }
      throw error;
    }
  });

  // 4. Testar API de guias (sem autenticação - deve dar 401)
  await testAPI('API Guias sem auth (GET /api/guias)', async () => {
    try {
      await axios.get(`${BASE_URL}/api/guias`);
      throw new Error('Deveria retornar 401');
    } catch (error: any) {
      if (error.response?.status === 401) {
        return 'Autenticação funcionando corretamente';
      }
      throw error;
    }
  });

  // 5. Testar API de sessões (sem autenticação - deve dar 401)
  await testAPI('API Sessões sem auth (GET /api/sessoes)', async () => {
    try {
      await axios.get(`${BASE_URL}/api/sessoes`);
      throw new Error('Deveria retornar 401');
    } catch (error: any) {
      if (error.response?.status === 401) {
        return 'Autenticação funcionando corretamente';
      }
      throw error;
    }
  });

  // 6. Testar API de pontos de encontro (sem autenticação)
  await testAPI('API Pontos sem auth (GET /api/pontos)', async () => {
    try {
      await axios.get(`${BASE_URL}/api/pontos`);
      throw new Error('Deveria retornar 401');
    } catch (error: any) {
      if (error.response?.status === 401) {
        return 'Autenticação funcionando corretamente';
      }
      throw error;
    }
  });

  // 7. Verificar se servidor está rodando corretamente
  await testAPI('Health Check (Servidor Next.js)', async () => {
    const response = await axios.get(`${BASE_URL}/_next/static/development/_devPagesManifest.json`);
    return response.status === 200 ? 'Servidor rodando' : 'Erro';
  });

  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS TESTES DE API');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`📈 Taxa de sucesso: ${((successCount / results.length) * 100).toFixed(0)}%\n`);

  if (errorCount > 0) {
    console.log('❌ Testes com erro:');
    results
      .filter(r => r.status === 'error')
      .forEach(r => {
        console.log(`   └─ ${r.name}: ${r.message}`);
      });
  }

  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('   1. Acesse http://localhost:3000/login');
  console.log('   2. Faça login com:');
  console.log('      Email: admin@vibrantcitytours.com');
  console.log('      Senha: admin123');
  console.log('   3. Teste as funcionalidades no dashboard\n');

  console.log('🎉 Testes concluídos!\n');
}

runTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erro ao executar testes:', error);
    process.exit(1);
  });
