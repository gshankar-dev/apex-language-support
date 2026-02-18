public class HST_Scheduler_592 implements Schedulable, Database.AllowsCallouts {

    public class ScheduleConfig {
        public String cronExpression { get; set; }
        public Map<String, String> jobParameters { get; set; }
        public List<String> batchSequence { get; set; }
        public Boolean abortOnError { get; set; }
        public Integer maxRetries { get; set; }

        public ScheduleConfig() {
            this.jobParameters = new Map<String, String>();
            this.batchSequence = new List<String>();
            this.abortOnError = false;
            this.maxRetries = 3;
        }
    }

    private ScheduleConfig config;

    public HST_Scheduler_592() {
        this.config = new ScheduleConfig();
    }

    public HST_Scheduler_592(ScheduleConfig config) {
        this.config = config;
    }

    public void execute(SchedulableContext sc) {
        try {
            if (config.batchSequence != null && !config.batchSequence.isEmpty()) {
                for (String batchClassName : config.batchSequence) {
                    Type batchType = Type.forName(batchClassName);
                    if (batchType != null) {
                        Object instance = batchType.newInstance();
                        if (instance instanceof Database.Batchable<SObject>) {
                            Database.executeBatch((Database.Batchable<SObject>) instance, 200);
                        }
                    }
                }
            } else {
                HST_BatchProcessor_586.BatchConfig batchConfig = new HST_BatchProcessor_586.BatchConfig(
                    'SELECT Id, Name FROM User WHERE LastModifiedDate = LAST_N_DAYS:7'
                ).withScope(200);

                for (String key : config.jobParameters.keySet()) {
                    batchConfig.withParam(key, config.jobParameters.get(key));
                }

                Database.executeBatch(new HST_BatchProcessor_586(batchConfig), batchConfig.scopeSize);
            }
        } catch (AsyncException ae) {
            System.debug(LoggingLevel.ERROR, 'HST_Scheduler_592: ' + ae.getMessage());
            if (config.abortOnError) {
                System.abortJob(sc.getTriggerId());
            }
        }
    }

    public static Id scheduleJob(String jobName, String cronExpr) {
        ScheduleConfig cfg = new ScheduleConfig();
        cfg.cronExpression = cronExpr;
        return System.schedule(jobName, cronExpr, new HST_Scheduler_592(cfg));
    }
}
