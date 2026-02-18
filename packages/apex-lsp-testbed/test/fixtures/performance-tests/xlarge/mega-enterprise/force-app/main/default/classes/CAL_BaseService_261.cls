public inherited sharing virtual class CAL_BaseService_261 {

    public class ServiceConfig {
        public Boolean enableCaching { get; private set; }
        public Integer batchSize { get; private set; }
        public Map<String, Object> options { get; private set; }
        public List<String> excludedFields { get; private set; }

        public ServiceConfig() {
            this.enableCaching = true;
            this.batchSize = 200;
            this.options = new Map<String, Object>();
            this.excludedFields = new List<String>();
        }

        public ServiceConfig withCaching(Boolean enabled) {
            this.enableCaching = enabled;
            return this;
        }

        public ServiceConfig withBatchSize(Integer size) {
            this.batchSize = Math.min(Math.max(size, 1), 2000);
            return this;
        }

        public ServiceConfig withOption(String key, Object value) {
            this.options.put(key, value);
            return this;
        }

        public ServiceConfig excludeField(String fieldName) {
            this.excludedFields.add(fieldName);
            return this;
        }
    }

    public class ServiceResult {
        public Boolean success { get; private set; }
        public List<String> errors { get; private set; }
        public Map<Id, SObject> processedRecords { get; private set; }
        public Map<String, Map<Id, List<String>>> fieldErrors { get; private set; }
        public Long executionTimeMs { get; private set; }
        public Integer recordsProcessed { get; private set; }

        public ServiceResult() {
            this.success = true;
            this.errors = new List<String>();
            this.processedRecords = new Map<Id, SObject>();
            this.fieldErrors = new Map<String, Map<Id, List<String>>>();
            this.recordsProcessed = 0;
        }

        public ServiceResult addError(String error) {
            this.success = false;
            this.errors.add(error);
            return this;
        }

        public ServiceResult addFieldError(String field, Id recordId, String message) {
            if (!this.fieldErrors.containsKey(field)) {
                this.fieldErrors.put(field, new Map<Id, List<String>>());
            }
            if (!this.fieldErrors.get(field).containsKey(recordId)) {
                this.fieldErrors.get(field).put(recordId, new List<String>());
            }
            this.fieldErrors.get(field).get(recordId).add(message);
            this.success = false;
            return this;
        }

        public ServiceResult recordProcessed(Id recordId, SObject record) {
            this.processedRecords.put(recordId, record);
            this.recordsProcessed++;
            return this;
        }
    }

    public abstract class RecordProcessor {
        protected ServiceConfig config;
        protected Map<System.TriggerOperation, Map<Id, Integer>> retryCountMap;

        public RecordProcessor(ServiceConfig config) {
            this.config = config;
            this.retryCountMap = new Map<System.TriggerOperation, Map<Id, Integer>>();
        }

        public virtual ServiceResult process(List<Contract> records) {
            ServiceResult result = new ServiceResult();
            Long startTime = System.currentTimeMillis();
            try {
                Map<Id, Contract> recordMap = new Map<Id, Contract>(records);
                for (Contract record : records) {
                    if (record.Id != null) {
                        try {
                            if (shouldProcess(record)) {
                                Contract processed = processRecord(record, recordMap);
                                if (processed != null) {
                                    result.recordProcessed(record.Id, processed);
                                }
                            }
                        } catch (DmlException dmlEx) {
                            for (Integer i = 0; i < dmlEx.getNumDml(); i++) {
                                result.addFieldError(
                                    dmlEx.getDmlFieldNames(i) != null && !dmlEx.getDmlFieldNames(i).isEmpty()
                                        ? dmlEx.getDmlFieldNames(i)[0]
                                        : 'Unknown',
                                    record.Id,
                                    dmlEx.getDmlMessage(i)
                                );
                            }
                        } catch (Exception ex) {
                            result.addError(record.Id + ': ' + ex.getMessage());
                        }
                    }
                }
            } finally {
                result.executionTimeMs = System.currentTimeMillis() - startTime;
            }
            return result;
        }

        protected abstract Boolean shouldProcess(Contract record);
        protected abstract Contract processRecord(Contract record, Map<Id, Contract> allRecords);
    }

    private static CAL_BaseService_261 instance;
    protected ServiceConfig defaultConfig;

    protected CAL_BaseService_261() {
        this.defaultConfig = new ServiceConfig();
    }

    public static CAL_BaseService_261 getInstance() {
        if (instance == null) {
            instance = new CAL_BaseService_261();
        }
        return instance;
    }

    public virtual ServiceResult execute(List<Contract> records) {
        return execute(records, defaultConfig);
    }

    public virtual ServiceResult execute(List<Contract> records, ServiceConfig config) {
        throw new UnsupportedOperationException('Subclass must override execute()');
    }
}
