# Code Review Consolidado - Portfolio API

**Fecha de Review:** 2026-01-08 (interno) + 2026-02-02 (externo Senior Dev)
**Estado:** Mejoras críticas identificadas
**Test Coverage:** 90.1% (165 tests, 25 test suites)

---

## 📊 Score del Proyecto

| Categoría | Score | Notas |
|-----------|-------|-------|
| 🏗️ Arquitectura | 8/10 | Estructura modular limpia, fuga de abstracción en `@core` |
| 🔒 Seguridad | 4/10 | **Penalizado por API keys en texto plano** |
| 💻 Código y Calidad | 9/10 | Excelentes patrones, tipo seguro |
| 🗄️ Database | 7/10 | Índices presentes, faltan transacciones |
| 🌐 API Design | 8/10 | RESTful, falta versionado `/api/v1` |
| 🧪 Testing | 10/10 | Cobertura excepcional |
| ⚡ Performance | 7/10 | Sin caching, health check ineficiente |

**Score General: 7.4/10**

---

## ✅ Fortalezas del Código

### 1. Arquitectura y Estructura
- ✅ Excelente organización modular siguiendo best practices de NestJS
- ✅ Separación clara de concerns (controllers, services, entities, DTOs)
- ✅ Uso apropiado de path aliases para imports más limpios
- ✅ **BaseCrudService** eliminando duplicación de código
- ✅ **PaginationUtil** para lógica de paginación reutilizable

### 2. Error Handling
- ✅ Global exception filter comprehensivo
- ✅ Custom exception classes con códigos de error apropiados
- ✅ Formato de respuesta estandarizado
- ✅ **Sin try-catch en services** - los errores burbujean naturalmente

### 3. API Design
- ✅ Diseño RESTful apropiado
- ✅ Uso correcto de HTTP status codes
- ✅ Formato de respuesta consistente (success/error)
- ✅ **Request ID tracking** vía AsyncLocalStorage para observabilidad
- ✅ Swagger/OpenAPI documentación con decorators estandarizados

### 4. Seguridad (Implementado)
- ✅ JWT authentication
- ✅ Password hashing con bcrypt
- ✅ Auth guards implementados (`AuthGuard`, `ApiKeyGuard`, `JwtOrApiKeyGuard`)
- ✅ **CORS configuration** basada en environment
- ✅ **Input validation** con global ValidationPipe
- ✅ **Rate limiting** implementado con `@nestjs/throttler`

### 5. Calidad de Código
- ✅ TypeScript strict typing
- ✅ **Sin tipos `any`** - interfaces apropiadas en todo el código
- ✅ Buen uso de decorators y validación
- ✅ Comentarios JSDoc comprehensivos en servicios
- ✅ **Type-safe request context** usando AsyncLocalStorage/nestjs-cls

### 6. Performance y Database
- ✅ **Índices en DB** para campos de consulta frecuente
- ✅ **Operaciones de update eficientes** (merge + save, 2 queries en vez de 3)
- ✅ Paginación en todos los endpoints de lista
- ✅ Query building optimizado

### 7. Testing
- ✅ **90.1% code coverage** excediendo target de 80%
- ✅ 165 tests en 25 test suites
- ✅ Todos los módulos tienen coverage

### 8. Documentación
- ✅ API documentación comprehensiva
- ✅ Swagger con decorators estandarizados
- ✅ JSDoc en código
- ✅ Response format standardization documentado

---

## 🔴 Problemas Críticos (Acción Inmediata)

### 1. API Keys en Texto Plano
- **Severidad:** CRÍTICA 🔴
- **Ubicación:** `src/core/entities/api-key.entity.ts`, `src/core/api-key.service.ts:38`
- **Problema:** Las API Keys se generan y guardan en texto plano en la base de datos
- **Impacto:** Si la DB se compromete, todas las llaves son legibles y utilizables
- **Solución:** Almacenar solo el hash de la llave (SHA-256 con salt)

```typescript
// src/core/api-key.service.ts - IMPLEMENTAR
async create(description?: string): Promise<{ key: string; entity: ApiKey }> {
  const plainKey = crypto.randomBytes(32).toString('hex');
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedKey = crypto.createHmac('sha256', salt).update(plainKey).digest('hex');

  const entity = await this.apiKeyRepository.save({
    key: hashedKey,
    salt,
    description
  });
  return { key: plainKey, entity }; // Solo se muestra al crear
}

async validate(key: string): Promise<boolean> {
  const hashedKey = crypto.createHmac('sha256', salt).update(key).digest('hex');
  const apiKey = await this.apiKeyRepository.findOne({
    where: { key: hashedKey, isActive: true },
  });
  return !!apiKey;
}
```

### 2. Falta de Security Headers (Helmet)
- **Severidad:** ALTA 🟠
- **Ubicación:** `src/main.ts`
- **Problema:** No hay headers de seguridad (XSS protection, CSP, HSTS, etc.)
- **Solución:** Instalar y aplicar `helmet`

```typescript
// src/main.ts - IMPLEMENTAR
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  // ...
}
```

### 3. Enumeración de Usuarios en Auth
- **Severidad:** MEDIA 🟡
- **Ubicación:** `src/auth/auth.service.ts:98`
- **Problema:** Diferencia entre "User not found" e "Invalid credentials"
- **Impacto:** Permite enumeración de usuarios válidos
- **Solución:** Mensaje genérico para ambos casos

```typescript
// src/auth/auth.service.ts - IMPLEMENTAR
async validateUser(email: string, password: string): Promise<User> {
  const user = await this.usersService.findOneByEmail(email);

  // Siempre el mismo mensaje para evitar enumeración
  if (!user) {
    throw new AuthenticationException('Invalid credentials');
  }

  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    throw new AuthenticationException('Invalid credentials');
  }
  return user;
}
```

---

## 🟡 Problemas de Corto Plazo (Próximo Sprint)

### 4. API Keys en Query Param (URL)
- **Severidad:** MEDIA 🟡
- **Ubicación:** `src/core/api-key.guard.ts:13`
- **Problema:** Se acepta `?api_key=` en URL, las URLs se loguean en servidores y navegadores
- **Solución:** Solo aceptar vía headers (`x-api-key` o `Authorization: ApiKey <key>`)

```typescript
// src/core/api-key.guard.ts - MODIFICAR
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();

  // Solo headers, NO query params
  let apiKey = request.headers['x-api-key'];

  if (!apiKey) {
    const authHeader = request.headers['authorization'];
    if (authHeader && typeof authHeader === 'string') {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'apikey') {
        apiKey = parts[1];
      }
    }
  }
  // ...
}
```

### 5. Falta Índice en Email de User
- **Severidad:** BAJA 🟢
- **Ubicación:** `src/users/entities/user.entity.ts`
- **Problema:** El campo `email` tiene `@Unique` pero no índice explícito
- **Solución:** Agregar índice para performance en volumen

```typescript
// src/users/entities/user.entity.ts
@Index()
@Column({ unique: true, length: 255 })
email: string;
```

### 6. Health Check Ineficiente
- **Severidad:** BAJA 🟢
- **Ubicación:** `src/health/health.controller.ts`
- **Problema:** Hace ping a `docs.nestjs.com` - si la documentación de NestJS se cae, tu API marca "Unhealthy"
- **Solución:** Verificar servicios internos (DB, Redis, etc.)

```typescript
// src/health/health.controller.ts - MODIFICAR
@Get()
@HealthCheck()
async check() {
  return this.health.check([
    () => this.db.pingCheck('database'),
    // Remover httpCheck a docs.nestjs.com
  ]);
}
```

### 7. Dependencias Redundantes
- **Severidad:** BAJA 🟢
- **Problema:** Proyecto usa `bcrypt` y `bcryptjs` simultáneamente
- **Solución:** Migrar todo a `bcrypt` (ya está instalado) o `@node-rs/bcrypt`

### 8. Falta Global Prefix
- **Severidad:** BAJA 🟢
- **Ubicación:** `src/main.ts`
- **Problema:** API sin versionado explícito
- **Solución:** Agregar `app.setGlobalPrefix('api/v1')`

---

## 🟢 Problemas de Largo Plazo (Backlog)

### 9. Fuga de Abstracción en Core
- **Ubicación:** `src/core/services/base-crud.service.ts`
- **Problema:** `BaseCrudService` importa `DeleteResponseDto` desde `@projects/dto`
- **Impacto:** El core no debe depender de módulos de dominio
- **Solución:** Mover DTOs genéricos a `@core/dto`

### 10. Falta Transacciones en DB
- **Problema:** No hay uso de `@Transaction()` o `DataSource.transaction()`
- **Solución:** Implementar transacciones para operaciones atómicas

### 11. Falta Caching
- **Problema:** Sin Redis o cache para `GET /projects`
- **Solución:** Implementar caché para endpoints de lectura frecuente

### 12. Falta Password Strength Validation
- **Ubicación:** `src/auth/dto/register.dto.ts`
- **Solución:** Agregar validación de fortaleza de password

```typescript
@IsString()
@MinLength(8)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
  message: 'Password must contain uppercase, lowercase, and number',
})
password: string;
```

### 13. Falta Environment Variable Validation
- **Solución:** Usar `joi` para validar variables de entorno al startup

### 14. Refresh Tokens
- **Problema:** Sin mecanismo de refresh token
- **Solución:** Implementar refresh token para mejor seguridad

### 15. Soft Delete No Implementado
- **Ubicación:** `src/core/entities/base.entity.ts:39` (campo existe)
- **Problema:** Campo `deletedAt` existe pero no hay lógica de soft delete
- **Solución:** Implementar soft delete en repositories o usar TypeORM soft delete

---

## 📋 Checklist de Mejoras

### 🔴 Crítico (Esta Semana)
- [ ] **Hashear API Keys** - Implementar hashing con salt
- [ ] **Agregar Helmet** - Security headers básicos
- [ ] **Unificar mensajes de auth** - Evitar enumeración de usuarios

### 🟡 Corto Plazo (Próximo Sprint)
- [ ] **Remover api_key de query params** - Solo headers
- [ ] **Agregar índice en email de User**
- [ ] **Fix health check** - Verificar DB en vez de externo
- [ ] **Eliminar bcryptjs redundante**
- [ ] **Agregar global prefix `/api/v1`**

### 🟢 Largo Plazo (Backlog)
- [ ] **Mover DTOs genéricos a @core** - Desacoplar core de dominio
- [ ] **Implementar transacciones de DB**
- [ ] **Caching Redis para GET /projects**
- [ ] **Password strength validation**
- [ ] **Environment variable validation con Joi**
- [ ] **Refresh tokens**
- [ ] **Soft delete implementation**

---

## 📝 Resumen Ejecutivo

El Portfolio API es una **API REST robusta** con arquitectura modular limpia y excelentes patrones de código. La cobertura de testing es excepcional (90.1%) y la documentación es comprehensiva.

**Problema Principal:** La seguridad es el punto más débil (4/10) debido al almacenamiento de API keys en texto plano, lo cual es crítico de resolver.

**Estado General:** El código es **production-ready** en términos de arquitectura y calidad, pero las vulnerabilidades de seguridad deben addressed inmediatamente antes de cualquier deployment a producción.

---

**Última Actualización:** 2026-02-02
**Reviewers:** Internal Team + Senior Backend Developer External
**Próxima Revisión:** Después de implementar mejoras críticas
