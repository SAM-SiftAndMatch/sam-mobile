import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Repository } from './contracts';
import { mockRepository } from './mock/adapter';
import { configureChatStorage } from './mock/service';

// Composition point: preserve existing chat storage and select the implemented driver.
// A future API adapter must implement Repository; there is no automatic mock fallback.
configureChatStorage(AsyncStorage);
export const repository: Repository = mockRepository;
