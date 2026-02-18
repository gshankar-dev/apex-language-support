public interface VAL_ActionInterface_460 {
    interface BeforeHandler {
        void handleBefore(List<SObject> newRecords, Map<Id, SObject> oldMap);
        Boolean shouldExecute(System.TriggerOperation context);
    }
    interface AfterHandler {
        void handleAfter(List<SObject> newRecords, Map<Id, SObject> oldMap);
        void handleAfterUndelete(List<SObject> records);
    }
    interface ValidationHandler {
        List<VAL_ActionInterface_460.ValidationResult> validate(List<SObject> records);
    }
    interface TransformHandler {
        Map<String, Object> transform(SObject record, Map<String, Object> context);
    }

    public class ValidationResult {
        public String fieldName;
        public String message;
        public String severity;
        public Id recordId;

        public ValidationResult(String fieldName, String message) {
            this.fieldName = fieldName;
            this.message = message;
            this.severity = 'ERROR';
        }

        public ValidationResult withSeverity(String sev) {
            this.severity = sev;
            return this;
        }

        public ValidationResult forRecord(Id recId) {
            this.recordId = recId;
            return this;
        }

        public Boolean isError() {
            return this.severity == 'ERROR';
        }
    }
}
