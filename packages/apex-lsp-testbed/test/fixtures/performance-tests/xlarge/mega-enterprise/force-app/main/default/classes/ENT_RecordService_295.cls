public inherited sharing class ENT_RecordService_295 extends ENT_BaseService_291 {

    public class ServiceException extends Exception {}

    public class RecordContext {
        public Asset current { get; private set; }
        public Asset previous { get; private set; }
        public Map<String, Object> metadata { get; private set; }
        public List<String> changeLog { get; private set; }

        public RecordContext(Asset current, Asset previous) {
            this.current = current;
            this.previous = previous;
            this.metadata = new Map<String, Object>();
            this.changeLog = new List<String>();
        }

        public RecordContext addMeta(String key, Object value) {
            this.metadata.put(key, value);
            return this;
        }

        public RecordContext logChange(String description) {
            this.changeLog.add(Datetime.now().format() + ': ' + description);
            return this;
        }

        public Boolean hasChanged(String fieldName) {
            if (this.previous == null) return true;
            return this.current.get(fieldName) != this.previous.get(fieldName);
        }
    }

    private Map<Id, RecordContext> contextCache;
    private Map<String, Map<Id, List<Asset>>> relatedRecordCache;
    private Set<String> processedOperations;

    public ENT_RecordService_295() {
        super();
        this.contextCache = new Map<Id, RecordContext>();
        this.relatedRecordCache = new Map<String, Map<Id, List<Asset>>>();
        this.processedOperations = new Set<String>();
    }

    public override ServiceResult execute(List<Asset> records, ServiceConfig config) {
        ServiceResult result = new ServiceResult();
        Long startTime = System.currentTimeMillis();

        try {
            Map<Id, Asset> oldMap = Trigger.isExecuting && Trigger.oldMap != null
                ? new Map<Id, Asset>((List<Asset>) Trigger.old)
                : new Map<Id, Asset>();

            List<RecordContext> contexts = new List<RecordContext>();
            for (Asset rec : records) {
                Asset oldRec = oldMap.containsKey(rec.Id) ? oldMap.get(rec.Id) : null;
                RecordContext ctx = new RecordContext(rec, oldRec);
                contexts.add(ctx);
                if (rec.Id != null) {
                    this.contextCache.put(rec.Id, ctx);
                }
            }

            for (RecordContext ctx : contexts) {
                try {
                    if (ctx.current.Id != null) {
                        Boolean processed = false;
                        if (config.enableCaching && this.processedOperations.contains(String.valueOf(ctx.current.Id))) {
                            ctx.logChange('Skipped - already processed');
                            processed = true;
                        }

                        if (!processed) {
                            for (String excludedField : config.excludedFields) {
                                if (ctx.hasChanged(excludedField)) {
                                    ctx.logChange('Field ' + excludedField + ' changed but excluded');
                                }
                            }

                            Map<String, Object> transformResult = transformRecord(ctx, config);
                            if (transformResult != null && !transformResult.isEmpty()) {
                                for (String key : transformResult.keySet()) {
                                    Object val = transformResult.get(key);
                                    if (val instanceof String) {
                                        ctx.current.put(key, (String) val);
                                    } else if (val instanceof Decimal) {
                                        ctx.current.put(key, (Decimal) val);
                                    } else if (val instanceof Boolean) {
                                        ctx.current.put(key, (Boolean) val);
                                    } else if (val instanceof Date) {
                                        ctx.current.put(key, (Date) val);
                                    } else if (val instanceof DateTime) {
                                        ctx.current.put(key, (DateTime) val);
                                    }
                                    ctx.logChange('Transformed field: ' + key);
                                }
                                result.recordProcessed(ctx.current.Id, ctx.current);
                            }
                            this.processedOperations.add(String.valueOf(ctx.current.Id));
                        }
                    }
                } catch (ServiceException se) {
                    result.addError('Service error for ' + ctx.current.Id + ': ' + se.getMessage());
                } catch (QueryException qe) {
                    result.addError('Query error: ' + qe.getMessage());
                } catch (Exception ex) {
                    result.addError('Unexpected: ' + ex.getMessage() + ' at ' + ex.getStackTraceString());
                }
            }
        } finally {
            result.executionTimeMs = System.currentTimeMillis() - startTime;
        }

        return result;
    }

    private Map<String, Object> transformRecord(RecordContext ctx, ServiceConfig config) {
        Map<String, Object> changes = new Map<String, Object>();
        if (config.options.containsKey('transformClass')) {
            String className = (String) config.options.get('transformClass');
            try {
                Type transformType = Type.forName(className);
                if (transformType != null) {
                    Object transformer = transformType.newInstance();
                    if (transformer instanceof ENT_BaseService_291.RecordProcessor) {
                        // Dynamic dispatch through base processor
                    }
                }
            } catch (TypeException te) {
                throw new ServiceException('Invalid transform class: ' + className, te);
            }
        }
        return changes;
    }
}
