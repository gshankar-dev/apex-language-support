@isTest
private class KPI_Test_364 {

    private class MockProcessor extends KPI_BaseService_353.RecordProcessor {
        private List<Id> processedIds;

        public MockProcessor(KPI_BaseService_353.ServiceConfig config) {
            super(config);
            this.processedIds = new List<Id>();
        }

        protected override Boolean shouldProcess(Contact record) {
            return record.Id != null;
        }

        protected override Contact processRecord(Contact record, Map<Id, Contact> allRecords) {
            this.processedIds.add(record.Id);
            return record;
        }
    }

    @TestSetup
    static void setupTestData() {
        List<Contact> records = new List<Contact>();
        for (Integer i = 0; i < 50; i++) {
            records.add(new Contact(
                Name = 'Test Record ' + String.valueOf(i).leftPad(4, '0')
            ));
        }
        insert records;
    }

    @isTest
    static void testServiceExecution() {
        List<Contact> records = [SELECT Id, Name FROM Contact LIMIT 10];
        KPI_BaseService_353.ServiceConfig config = new KPI_BaseService_353.ServiceConfig()
            .withCaching(true)
            .withBatchSize(100)
            .withOption('mode', 'test')
            .excludeField('OwnerId');

        Test.startTest();
        KPI_RecordService_353 service = new KPI_RecordService_353();
        KPI_BaseService_353.ServiceResult result = service.execute(records, config);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(result.success, 'Execution should succeed: ' + String.join(result.errors, ', '));
    }

    @isTest
    static void testServiceWithErrors() {
        KPI_BaseService_353.ServiceConfig config = new KPI_BaseService_353.ServiceConfig();
        KPI_BaseService_353.ServiceResult result = new KPI_BaseService_353.ServiceResult();
        result.addError('Test error');
        result.addFieldError('Name', null, 'Invalid name');

        System.assertEquals(false, result.success, 'Should be failed');
        System.assertEquals(1, result.errors.size(), 'Should have one error');
        System.assert(result.fieldErrors.containsKey('Name'), 'Should have field error');
    }

    @isTest
    static void testMockProcessor() {
        List<Contact> records = [SELECT Id, Name FROM Contact LIMIT 5];
        KPI_BaseService_353.ServiceConfig config = new KPI_BaseService_353.ServiceConfig()
            .withBatchSize(50);

        MockProcessor processor = new MockProcessor(config);

        Test.startTest();
        KPI_BaseService_353.ServiceResult result = processor.process(records);
        Test.stopTest();

        System.assertEquals(records.size(), processor.processedIds.size(), 'All records should be processed');
        System.assertEquals(records.size(), result.recordsProcessed, 'Count should match');
    }

    @isTest
    static void testConfigBuilder() {
        KPI_BaseService_353.ServiceConfig config = new KPI_BaseService_353.ServiceConfig()
            .withCaching(false)
            .withBatchSize(50)
            .withOption('key1', 'value1')
            .withOption('key2', 'value2')
            .excludeField('Field1')
            .excludeField('Field2');

        System.assertEquals(false, config.enableCaching, 'Caching should be disabled');
        System.assertEquals(50, config.batchSize, 'Batch size should be 50');
        System.assertEquals(2, config.options.size(), 'Should have 2 options');
        System.assertEquals(2, config.excludedFields.size(), 'Should have 2 excluded fields');
    }

    @isTest
    static void testServiceResultChaining() {
        KPI_BaseService_353.ServiceResult result = new KPI_BaseService_353.ServiceResult();
        Contact testRecord = [SELECT Id FROM Contact LIMIT 1];

        result.recordProcessed(testRecord.Id, testRecord)
            .addFieldError('Status', testRecord.Id, 'Invalid status')
            .addFieldError('Status', testRecord.Id, 'Another error')
            .addError('General error');

        System.assertEquals(false, result.success);
        System.assertEquals(1, result.errors.size());
        System.assertEquals(1, result.processedRecords.size());
        System.assert(result.fieldErrors.containsKey('Status'));
        System.assertEquals(2, result.fieldErrors.get('Status').get(testRecord.Id).size());
    }
}
